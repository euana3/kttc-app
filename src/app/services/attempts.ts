import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environment/environment';

export interface IndicatorScore {
  indicator_id: number;
  name: string;
  measurement: string;
  weight: number;
  score: number | null;
}

export interface PastAttempt {
  id: number;
  attempt_number: number;
  score: number | null;
}

export interface AttemptReport {
  content: string;
  suggestions: string | null;
}

export type Report = AttemptReport;

export type AttemptStatus = 'to_do' | 'in_progress' | 'completed' | 'failed';

export interface AttemptDetail {
  id: number;
  module_id: number;
  module_name: string;
  trainee_id: number;
  trainee_name: string;
  batch_id: number;
  attempt_number: number;
  max_attempts: number;
  status: AttemptStatus;
  score: number | null;
  avg_time_per_session: string | null;
  is_live: boolean;
  indicator_scores: IndicatorScore[];
  past_attempts: PastAttempt[];
  report: AttemptReport | null;
}

// Shape as actually returned by GET /api/attempts/:id.
// NOTE: performance_indicators was only observed empty (attempt 25, in_progress).
// The inner item shape below (indicator_id/name/measurement/weight/score) is inferred
// from the backend guide's schema description, not yet confirmed against a populated
// example — check GET /api/attempts/1 (completed, 3rd attempt) to verify.
interface RawAttemptDetail {
  id: number;
  trainee_id: number;
  module_id: number;
  batch_id: number;
  attempt_number: number;
  max_attempts: number;
  status: AttemptStatus;
  score: string | null;
  avg_time_per_session: string | null;
  started_at: string;
  completed_at: string | null;
  is_live: boolean;
  created_at: string;
  trainee_name: string;
  module_name: string;
  performance_indicators: {
    indicator_id: number;
    name: string;
    measurement: string;
    weight: string | number;
    score: string | null;
  }[];
  past_attempts: { id: number; attempt_number: number; score: string | null }[];
  report: AttemptReport | null;
}

@Injectable({ providedIn: 'root' })
export class AttemptsService {
  private readonly baseUrl = `${environment.apiUrl}/attempts`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<AttemptDetail> {
    return this.http.get<RawAttemptDetail>(`${this.baseUrl}/${id}`).pipe(
      map(raw => ({
        id: raw.id,
        module_id: raw.module_id,
        module_name: raw.module_name,
        trainee_id: raw.trainee_id,
        trainee_name: raw.trainee_name,
        batch_id: raw.batch_id,
        attempt_number: raw.attempt_number,
        max_attempts: raw.max_attempts,
        status: raw.status,
        score: raw.score !== null ? Number(raw.score) : null,
        avg_time_per_session: raw.avg_time_per_session,
        is_live: raw.is_live,
        indicator_scores: raw.performance_indicators.map(ind => ({
          indicator_id: ind.indicator_id,
          name: ind.name,
          measurement: ind.measurement,
          weight: Number(ind.weight),
          score: ind.score !== null ? Number(ind.score) : null,
        })),
        past_attempts: raw.past_attempts.map(p => ({
          id: p.id,
          attempt_number: p.attempt_number,
          score: p.score !== null ? Number(p.score) : null,
        })),
        report: raw.report,
      }))
    );
  }

  create(payload: { trainee_id: number; module_id: number; batch_id: number }) {
    return this.http.post(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<{ status: string; score: number; is_live: boolean }>) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  getEvents(id: number): Observable<{ id: number; event_type: string; description: string; is_error: boolean; created_at: string }[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${id}/events`);
  }

  addEvent(id: number, payload: { event_type: string; description: string; is_error: boolean }) {
    return this.http.post(`${this.baseUrl}/${id}/events`, payload);
  }

  connectLive(id: number): WebSocket {
    const wsUrl = environment.apiUrl.replace(/^http/, 'ws');
    return new WebSocket(`${wsUrl}/attempts/${id}/live`);
  }
}