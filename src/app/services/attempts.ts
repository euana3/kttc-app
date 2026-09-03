import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

// Matches the Postgres enum exactly
export type AttemptStatus = 'to_do' | 'in_progress' | 'completed' | 'failed';

export interface ModuleAttempt {
  id: number;
  trainee_id: number;
  module_id: number;
  batch_id: number;
  attempt_number: number;
  max_attempts: number;
  status: AttemptStatus;
  score: number | null;
  avg_time_per_session: string | null;
  started_at: string | null;
  completed_at: string | null;
  is_live: boolean;
  created_at: string;
}

export interface IndicatorScore {
  indicator_id: number;
  name: string;
  measurement: string | null;
  weight: number | null;
  score: number | null;
}

export interface Report {
  id: number;
  entity_type: 'module' | 'cohort' | 'trainee_module';
  entity_id: number;
  batch_id: number | null;
  content: string | null;
  suggestions: string | null;
  generated_at: string;
}

// GET /:id shape
export interface AttemptDetail extends ModuleAttempt {
  indicator_scores: IndicatorScore[];
  past_attempts: ModuleAttempt[]; // same trainee, same module, earlier attempts
  report: Report | null;
}

export interface AttemptEvent {
  id: number;
  attempt_id: number;
  event_type: string;
  description: string;
  is_error: boolean;
  created_at: string;
}

export interface CreateAttemptPayload {
  trainee_id: number;
  module_id: number;
  batch_id: number;
}

export interface UpdateAttemptPayload {
  status?: AttemptStatus;
  score?: number;
  is_live?: boolean;
}

export interface CreateAttemptEventPayload {
  event_type: string;
  description: string;
  is_error?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AttemptsService {

  private readonly baseUrl = `${environment.apiUrl}/attempts`;

  constructor(private http: HttpClient) {}

  // GET /:id — full attempt detail
  getById(id: number): Observable<AttemptDetail> {
    return this.http.get<AttemptDetail>(`${this.baseUrl}/${id}`);
  }

  // POST / — start a new attempt (attempt_number computed server-side, is_live set true)
  create(payload: CreateAttemptPayload): Observable<ModuleAttempt> {
    return this.http.post<ModuleAttempt>(`${this.baseUrl}/`, payload);
  }

  // PUT /:id — update status / score / is_live
  update(id: number, payload: UpdateAttemptPayload): Observable<ModuleAttempt> {
    return this.http.put<ModuleAttempt>(`${this.baseUrl}/${id}`, payload);
  }

  // GET /:id/events — full event log
  getEvents(id: number): Observable<AttemptEvent[]> {
    return this.http.get<AttemptEvent[]>(`${this.baseUrl}/${id}/events`);
  }

  // POST /:id/events — append an event
  addEvent(id: number, event: CreateAttemptEventPayload): Observable<AttemptEvent> {
    return this.http.post<AttemptEvent>(`${this.baseUrl}/${id}/events`, event);
  }

  // GET /:id/live (WebSocket)
  connectLive(id: number): WebSocket {
    const wsUrl = environment.apiUrl.replace(/^http/, 'ws');
    return new WebSocket(`${wsUrl}/attempts/${id}/live`);
  }
}