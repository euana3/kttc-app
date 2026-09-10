import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../environment/environment';
import { AttemptStatus } from './attempts';

export interface Trainee {
  id: number;
  name: string;
  email: string | null;
  created_at: string;
}

export interface CreateTraineePayload {
  name: string;
  email?: string;
}

// One row in the trainee's "learning path" — one module attempt, in course order.
// Confirmed against GET /api/trainees/1/batches/1: attempt_number is always a real
// number (0 = not yet attempted, never null), status is exactly AttemptStatus.
export interface LearningPathEntry {
  module_id: number;
  module_name: string;
  attempt_id: number | null;
  attempt_number: number;
  max_attempts: number;
  status: AttemptStatus;
  score: number | null;
  is_live: boolean;
}

export interface TraineeBatchDetail {
  trainee: Trainee;
  batch_id: number;
  overall_stats: {
    avg_time_per_session: string | null;
  };
  learning_path: LearningPathEntry[];
  live_event_log?: {
    attempt_id: number;
    events: Array<{
      id: number;
      event_type: string;
      description: string;
      is_error: boolean;
      created_at: string;
    }>;
  };
}

// Shape as actually returned by GET /api/trainees/:id/batches/:batchId — confirmed
// via Postman. "stats" not "overall_stats", flat live_attempt_id/live_events, score as string.
interface RawTraineeBatchDetail {
  trainee: Trainee;
  batch: { id: number; course_id: number; name: string; course_name: string };
  stats: { avg_time_per_session: string | null };
  learning_path: {
    attempt_id: number | null;
    module_id: number;
    module_name: string;
    attempt_number: number;
    max_attempts: number;
    status: AttemptStatus;
    score: string | null;
    is_live: boolean;
  }[];
  live_attempt_id: number | null;
  live_events: Array<{
    id: number;
    attempt_id: number;
    event_type: string;
    description: string;
    is_error: boolean;
    created_at: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class TraineesService {

  private readonly baseUrl = `${environment.apiUrl}/trainees`;

  constructor(private http: HttpClient) {}

  // GET / — all trainees
  getAll(): Observable<Trainee[]> {
    return this.http.get<Trainee[]>(`${this.baseUrl}/`);
  }

  // POST / — create a trainee
  create(payload: CreateTraineePayload): Observable<Trainee> {
    return this.http.post<Trainee>(`${this.baseUrl}/`, payload);
  }

  // GET /:id — one trainee
  getById(id: number): Observable<Trainee> {
    return this.http.get<Trainee>(`${this.baseUrl}/${id}`);
  }

  // PUT /:id — partial update
  update(id: number, payload: Partial<CreateTraineePayload>): Observable<Trainee> {
    return this.http.put<Trainee>(`${this.baseUrl}/${id}`, payload);
  }

  // DELETE /:id
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // GET /:id/batches/:batchId — trainee-detail page payload, mapped from the real
  // raw shape (RawTraineeBatchDetail) into what trainee-detail.html actually consumes
  getBatchDetail(traineeId: number, batchId: number): Observable<TraineeBatchDetail> {
    return this.http.get<RawTraineeBatchDetail>(`${this.baseUrl}/${traineeId}/batches/${batchId}`).pipe(
      map(raw => ({
        trainee: raw.trainee,
        batch_id: raw.batch.id,
        overall_stats: raw.stats,
        learning_path: raw.learning_path.map(entry => ({
          ...entry,
          score: entry.score !== null ? Number(entry.score) : null,
        })),
        live_event_log: raw.live_attempt_id
          ? { attempt_id: raw.live_attempt_id, events: raw.live_events }
          : undefined,
      }))
    );
  }
}