import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Report } from './attempts';

export interface DashboardStats {
  totals: {
    trainees: number;
    trainers: number;
    courses: number;
    modules: number;
    batches: number;
  };
  completion_rate: number;
  average_score: number;
  enrolment_by_category: Array<{ category: string; count: number }>;
  recent_activity: Array<{
    id: number;
    description: string;
    created_at: string;
  }>;
}

export interface AttentionItem {
  report: Report;
  entity_name: string; // module name or cohort/batch name
}

export interface ModuleAnalysis {
  module_id: number;
  module_name: string;
  batch_id: number | null; // null = all-time stats
  average_score: number;
  pass_rate: number;
  attempt_count: number;
  report: Report | null;
}

export interface CohortAnalysis {
  batch_id: number;
  batch_name: string;
  average_score: number;
  pass_rate: number;
  hardest_module: { module_id: number; module_name: string; average_score: number };
  flagged_trainees: Array<{
    trainee_id: number;
    trainee_name: string;
    error_event_count: number;
  }>;
  report: Report | null;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {

  private readonly baseUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  // GET /dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard`);
  }

  // GET /attention
  getAttentionItems(): Observable<AttentionItem[]> {
    return this.http.get<AttentionItem[]>(`${this.baseUrl}/attention`);
  }

  // GET /modules/:id?batchId=
  getModuleAnalysis(moduleId: number, batchId?: number): Observable<ModuleAnalysis> {
    const url = batchId
      ? `${this.baseUrl}/modules/${moduleId}?batchId=${batchId}`
      : `${this.baseUrl}/modules/${moduleId}`;
    return this.http.get<ModuleAnalysis>(url);
  }

  // GET /cohorts/:batchId
  getCohortAnalysis(batchId: number): Observable<CohortAnalysis> {
    return this.http.get<CohortAnalysis>(`${this.baseUrl}/cohorts/${batchId}`);
  }
}