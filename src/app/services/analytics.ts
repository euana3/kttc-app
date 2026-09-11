import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../environment/environment';

// ── Dashboard overview ──────────────────────────────────────────────────
// Confirmed via GET /api/analytics/dashboard.
export interface EnrolmentByCategory {
  course_name: string;
  enrolled: number;
  completed: number;
}

export interface RecentActivityItem {
  description: string;
  is_error: boolean;
  created_at: string;
  trainee_name: string;
  module_name: string;
}

export interface DashboardOverview {
  total_trainees: number;
  active_courses: number;
  completion_rate: number;
  avg_score: number;
  enrolment_by_category: EnrolmentByCategory[];
  recent_activity: RecentActivityItem[];
}

interface RawDashboardOverview {
  total_trainees: number;
  active_courses: number;
  completion_rate: number;
  avg_score: number;
  enrolment_by_category: { course_name: string; enrolled: string; completed: string }[];
  recent_activity: RecentActivityItem[];
}

// ── Needs attention ──────────────────────────────────────────────────────
// Confirmed via GET /api/analytics/attention. Neither modules[] nor cohorts[]
// carry a "message" field — that text is generated on the frontend.
export interface AttentionItem {
  type: 'module' | 'cohort';
  id: number;
  title: string;
  message: string;
  batchId?: number;
}

interface RawAttentionModule {
  module_id: number;
  module_name: string;
  batch_id: number;
  batch_name: string;
}

interface RawAttentionCohort {
  batch_id: number;
  batch_name: string;
  course_name: string;
}

interface RawAttentionResponse {
  modules: RawAttentionModule[];
  cohorts: RawAttentionCohort[];
}

// ── Module analysis ──────────────────────────────────────────────────────
// Confirmed via GET /api/analytics/modules/1. Nested `module` object, no
// `flagged` field — applied here as: flagged = report !== null, per the
// guide's own description of /attention.
export interface ModuleAnalysis {
  module_id: number;
  module_name: string;
  description: string | null;
  skills_learnt: string | null;
  estimated_time: string | null;
  average_score: number;
  pass_rate: number;
  attempt_count: number;
  flagged: boolean;
  report: { content: string; suggestions: string | null } | null;
}

interface RawModuleAnalysis {
  module: {
    id: number;
    name: string;
    description: string | null;
    skills_learnt: string | null;
    estimated_time: string | null;
    created_at: string;
  };
  stats: {
    avg_score: number | string;
    pass_rate: number | string;
    attempt_count: number | string;
  };
  report: { content: string; suggestions: string | null } | null;
}

// ── Cohort analysis ───────────────────────────────────────────────────────
// Confirmed via GET /api/analytics/cohorts/1. Nested `batch` object,
// hardest_module is an object not a string, trainee list is `anomalous_trainees`
// with only error_count (no reason text — composed on the frontend).
export interface HardestModule {
  name: string;
  avg_score: number;
}

export interface AnomalousTrainee {
  id: number;
  name: string;
  error_count: number;
}

export interface CohortAnalysis {
  batch_id: number;
  batch_name: string;
  course_name: string;
  start_date: string;
  end_date: string;
  average_score: number;
  pass_rate: number;
  hardest_module: HardestModule | null;
  anomalous_trainees: AnomalousTrainee[];
  flagged: boolean;
  report: { content: string; suggestions: string | null } | null;
}

interface RawCohortAnalysis {
  batch: {
    id: number;
    course_id: number;
    name: string;
    start_date: string;
    end_date: string;
    created_at: string;
    course_name: string;
  };
  stats: {
    avg_score: number | string;
    pass_rate: number | string;
    hardest_module: { name: string; avg_score: string | number } | null;
    anomalous_trainees: { id: number; name: string; error_count: string | number }[];
  };
  report: { content: string; suggestions: string | null } | null;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {

  private readonly baseUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  // GET /dashboard
  getDashboard(): Observable<DashboardOverview> {
    return this.http.get<RawDashboardOverview>(`${this.baseUrl}/dashboard`).pipe(
      map(raw => ({
        total_trainees: raw.total_trainees,
        active_courses: raw.active_courses,
        completion_rate: raw.completion_rate,
        avg_score: raw.avg_score,
        enrolment_by_category: raw.enrolment_by_category.map(c => ({
          course_name: c.course_name,
          enrolled: Number(c.enrolled),
          completed: Number(c.completed),
        })),
        recent_activity: raw.recent_activity,
      }))
    );
  }

  // GET /attention
  getAttention(): Observable<AttentionItem[]> {
    return this.http.get<RawAttentionResponse>(`${this.baseUrl}/attention`).pipe(
      map(raw => [
        ...(raw.modules ?? []).map(m => ({
          type: 'module' as const,
          id: m.module_id,
          batchId: m.batch_id,
          title: m.module_name.toUpperCase(),
          message: `${m.batch_name} requires some attention`,
        })),
        ...(raw.cohorts ?? []).map(c => ({
          type: 'cohort' as const,
          id: c.batch_id,
          title: `${c.course_name} / ${c.batch_name}`.toUpperCase(),
          message: 'Cohort requires some attention',
        })),
      ])
    );
  }

  // GET /modules/:id?batchId=
  getModuleAnalysis(moduleId: number, batchId?: number): Observable<ModuleAnalysis> {
    let url = `${this.baseUrl}/modules/${moduleId}`;
    if (batchId) url += `?batchId=${batchId}`;

    return this.http.get<RawModuleAnalysis>(url).pipe(
      map(raw => ({
        module_id: raw.module.id,
        module_name: raw.module.name,
        description: raw.module.description,
        skills_learnt: raw.module.skills_learnt,
        estimated_time: raw.module.estimated_time,
        average_score: Number(raw.stats.avg_score),
        pass_rate: Number(raw.stats.pass_rate),
        attempt_count: Number(raw.stats.attempt_count),
        flagged: raw.report !== null,
        report: raw.report,
      }))
    );
  }

  // GET /cohorts/:batchId
  getCohortAnalysis(batchId: number): Observable<CohortAnalysis> {
    return this.http.get<RawCohortAnalysis>(`${this.baseUrl}/cohorts/${batchId}`).pipe(
      map(raw => ({
        batch_id: raw.batch.id,
        batch_name: raw.batch.name,
        course_name: raw.batch.course_name,
        start_date: raw.batch.start_date,
        end_date: raw.batch.end_date,
        average_score: Number(raw.stats.avg_score),
        pass_rate: Number(raw.stats.pass_rate),
        hardest_module: raw.stats.hardest_module
          ? { name: raw.stats.hardest_module.name, avg_score: Number(raw.stats.hardest_module.avg_score) }
          : null,
        anomalous_trainees: (raw.stats.anomalous_trainees ?? []).map(t => ({
          id: t.id,
          name: t.name,
          error_count: Number(t.error_count),
        })),
        flagged: raw.report !== null,
        report: raw.report,
      }))
    );
  }

  suggestionLines(suggestions: string | null): string[] {
    if (!suggestions) return [];
    return suggestions
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+[\.\)\-]\s*/, ''));
  }
}