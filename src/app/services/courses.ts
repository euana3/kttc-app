import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Batch } from './batches';
import { CourseModule } from './modules';

export interface Course {
  id: number;
  name: string;
  description: string | null;
  skills_learnt: string | null;
  estimated_time: string | null;
  created_at: string; // TIMESTAMPTZ serializes as ISO string over JSON
}

// GET /:id shape — course with its relations populated
export interface CourseDetail extends Course {
  modules: CourseModule[];           // via course_modules join, ordered by sort_order
  prerequisite_courses: Course[];    // via course_prerequisites join
  batches: Batch[];
}

export interface CreateCoursePayload {
  name: string;
  description?: string;
  skills_learnt?: string;
  estimated_time?: string;
  module_ids?: number[];
  prerequisite_course_ids?: number[];
  trainee_ids?: number[]; // if given, also creates Batch 1 and enrolls them
}

@Injectable({
  providedIn: 'root',
})
export class CoursesService {

  private readonly baseUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  // GET / — all courses, plus every batch (Courses management page)
  getAll(): Observable<{ courses: Course[]; batches: Batch[] }> {
    return this.http.get<{ courses: Course[]; batches: Batch[] }>(`${this.baseUrl}/`);
  }

  // GET /:id — one course with modules, prerequisites, batches
  getById(id: number): Observable<CourseDetail> {
    return this.http.get<CourseDetail>(`${this.baseUrl}/${id}`);
  }

  // POST / — create a course
  create(payload: CreateCoursePayload): Observable<Course> {
    return this.http.post<Course>(`${this.baseUrl}/`, payload);
  }

  // PUT /:id — partial update
  update(id: number, payload: Partial<CreateCoursePayload>): Observable<Course> {
    return this.http.put<Course>(`${this.baseUrl}/${id}`, payload);
  }

  // DELETE /:id — cascades to course_modules, batches, etc.
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}