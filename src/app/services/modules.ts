import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

export interface CourseModule {
  id: number;
  name: string;
  description: string | null;
  skills_learnt: string | null;
  estimated_time: string | null;
  created_at: string;
}

export interface PerformanceIndicator {
  id: number;
  module_id: number;
  name: string;
  measurement: string | null;
  weight: number | null;
}

// GET /:id shape — module with relations
export interface ModuleDetail extends CourseModule {
  prerequisite_modules: CourseModule[]; // via module_prerequisites
  performance_indicators: PerformanceIndicator[];
}

export interface CreateModulePayload {
  name: string;
  description?: string;
  skills_learnt?: string;
  estimated_time?: string;
  prerequisite_module_ids?: number[];
}

export interface CreatePerformanceIndicatorPayload {
  name: string;
  measurement: string;
  weight: number;
}

@Injectable({
  providedIn: 'root',
})
export class ModulesService {

  private readonly baseUrl = `${environment.apiUrl}/modules`;

  constructor(private http: HttpClient) {}

  // GET / — all modules
  getAll(): Observable<CourseModule[]> {
    return this.http.get<CourseModule[]>(`${this.baseUrl}/`);
  }

  // GET /:id — one module with prerequisites + performance indicators
  getById(id: number): Observable<ModuleDetail> {
    return this.http.get<ModuleDetail>(`${this.baseUrl}/${id}`);
  }

  // POST / — create a module
  create(payload: CreateModulePayload): Observable<CourseModule> {
    return this.http.post<CourseModule>(`${this.baseUrl}/`, payload);
  }

  // PUT /:id — partial update
  update(id: number, payload: Partial<CreateModulePayload>): Observable<CourseModule> {
    return this.http.put<CourseModule>(`${this.baseUrl}/${id}`, payload);
  }

  // DELETE /:id
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // POST /:id/performance-indicators — add a scoring indicator
  addPerformanceIndicator(id: number, indicator: CreatePerformanceIndicatorPayload): Observable<PerformanceIndicator> {
    return this.http.post<PerformanceIndicator>(`${this.baseUrl}/${id}/performance-indicators`, indicator);
  }
}