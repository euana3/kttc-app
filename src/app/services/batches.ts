import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../environment/environment';

// Base batch row — used by courses.ts (CourseDetail.batches, getAll().batches)
export interface Batch {
  id: number;
  course_id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

// The /api/batches list response adds course_name + trainee_count on top of Batch
export interface BatchWithCourseName extends Batch {
  course_name: string;
  trainee_count: number;
}

export interface BatchModuleProgress {
  module_id: number;
  module_name: string;
  average_progress_percent: number;
}

export interface BatchTraineeProgress {
  trainee: { id: number; name: string };
  progress_percent: number;
  status: 'live' | 'attention' | 'ok';
}

export interface BatchDetail {
  id: number;
  course_id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  course_name: string;
  module_progress: BatchModuleProgress[];
  trainee_progress: BatchTraineeProgress[];
}

export interface CreateBatchPayload {
  course_id: number;
  name: string;
  start_date: string;
  end_date: string;
  trainee_ids?: number[];
}

// Shape as actually returned by GET /api/batches/:id — confirmed via Postman.
// Flat modules[]/trainees[], different field names than what batch-detail.html expects.
interface RawBatchDetail {
  id: number;
  course_id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  course_name: string;
  modules: { id: number; name: string; avg_progress: number; completed: boolean }[];
  trainees: { id: number; name: string; progress: number; status: 'live' | 'attention' | 'ok' }[];
}

@Injectable({
  providedIn: 'root',
})
export class BatchesService {

  private readonly baseUrl = `${environment.apiUrl}/batches`;

  constructor(private http: HttpClient) {}

  // GET /?status=active|upcoming
  getAll(status?: 'active' | 'upcoming'): Observable<BatchWithCourseName[]> {
    let url = `${this.baseUrl}/`;
    if (status) url += `?status=${status}`;

    return this.http.get<any[]>(url).pipe(
      map(batches => batches.map(b => ({ ...b, trainee_count: Number(b.trainee_count) })))
    );
  }

  // GET /:id — mapped from the real flat modules[]/trainees[] shape into what
  // batch-detail.html actually consumes (module_progress[] / trainee_progress[])
  getById(id: number): Observable<BatchDetail> {
    return this.http.get<RawBatchDetail>(`${this.baseUrl}/${id}`).pipe(
      map(raw => ({
        id: raw.id,
        course_id: raw.course_id,
        name: raw.name,
        start_date: raw.start_date,
        end_date: raw.end_date,
        course_name: raw.course_name,
        module_progress: raw.modules.map(m => ({
          module_id: m.id,
          module_name: m.name,
          average_progress_percent: m.avg_progress,
        })),
        trainee_progress: raw.trainees.map(t => ({
          trainee: { id: t.id, name: t.name },
          progress_percent: t.progress,
          status: t.status,
        })),
      }))
    );
  }

  // POST /
  create(payload: CreateBatchPayload): Observable<BatchWithCourseName> {
    return this.http.post<BatchWithCourseName>(`${this.baseUrl}/`, payload);
  }

  // PUT /:id
  update(id: number, payload: Partial<{ name: string; start_date: string; end_date: string }>): Observable<BatchWithCourseName> {
    return this.http.put<BatchWithCourseName>(`${this.baseUrl}/${id}`, payload);
  }

  // DELETE /:id
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // POST /:id/trainees
  enrollTrainee(batchId: number, traineeId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${batchId}/trainees`, { trainee_id: traineeId });
  }

  // DELETE /:id/trainees/:traineeId
  unenrollTrainee(batchId: number, traineeId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${batchId}/trainees/${traineeId}`);
  }
}