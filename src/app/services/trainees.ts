import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

// One row in the trainee's "learning path" — one module attempt, in course order
export interface LearningPathEntry {
  module_id: number;
  module_name: string;
  attempt_id: number | null;
  attempt_number: number | null;
  status: AttemptStatus | 'not_started';
  score: number | null;
}

export interface TraineeBatchDetail {
  trainee: Trainee;
  batch_id: number;
  overall_stats: {
    completed_modules: number;
    total_modules: number;
    average_score: number | null;
  };
  learning_path: LearningPathEntry[];
  live_event_log?: { // present only if trainee has a live attempt right now
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

  // GET /:id/batches/:batchId — trainee-detail page payload
  getBatchDetail(traineeId: number, batchId: number): Observable<TraineeBatchDetail> {
    return this.http.get<TraineeBatchDetail>(`${this.baseUrl}/${traineeId}/batches/${batchId}`);
  }
}