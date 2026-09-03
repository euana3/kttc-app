import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Trainee } from './trainees';

export interface Batch {
  id: number;
  course_id: number;
  name: string;
  start_date: string | null; // DATE serializes as 'YYYY-MM-DD'
  end_date: string | null;
  created_at: string;
}

export type TraineeStatusDot = 'live' | 'attention' | 'ok';

export interface BatchTraineeProgress {
  trainee: Trainee;
  progress_percent: number;
  status: TraineeStatusDot; // computed server-side, see note below
}

export interface BatchModuleProgress {
  module_id: number;
  module_name: string;
  average_progress_percent: number;
}

// GET /:id shape
export interface BatchDetail extends Batch {
  module_progress: BatchModuleProgress[];
  trainee_progress: BatchTraineeProgress[];
}

export type BatchStatusFilter = 'active' | 'upcoming';

export interface CreateBatchPayload {
  course_id: number;
  name: string;
  start_date: string;
  end_date: string;
  trainee_ids?: number[];
}

@Injectable({
  providedIn: 'root',
})
export class BatchesService {

  private readonly baseUrl = `${environment.apiUrl}/batches`;

  constructor(private http: HttpClient) {}

  // GET /?status=active|upcoming
  getAll(status?: BatchStatusFilter): Observable<Batch[]> {
    const url = status ? `${this.baseUrl}/?status=${status}` : `${this.baseUrl}/`;
    return this.http.get<Batch[]>(url);
  }

  // GET /:id — full batch detail
  getById(id: number): Observable<BatchDetail> {
    return this.http.get<BatchDetail>(`${this.baseUrl}/${id}`);
  }

  // POST / — create a batch
  create(payload: CreateBatchPayload): Observable<Batch> {
    return this.http.post<Batch>(`${this.baseUrl}/`, payload);
  }

  // PUT /:id — partial update
  update(id: number, payload: Partial<CreateBatchPayload>): Observable<Batch> {
    return this.http.put<Batch>(`${this.baseUrl}/${id}`, payload);
  }

  // DELETE /:id
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // POST /:id/trainees — enroll one trainee
  enrollTrainee(batchId: number, traineeId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${batchId}/trainees`, { trainee_id: traineeId });
  }

  // DELETE /:id/trainees/:traineeId — un-enroll
  unenrollTrainee(batchId: number, traineeId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${batchId}/trainees/${traineeId}`);
  }
}