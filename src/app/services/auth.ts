import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../environment/environment';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  // Login function that sends username and password to the backend and handles response
  loginWithUsername(username: string, password: string): Observable<any> {
    const payload = { username, password }
    return this.http.post(`${environment.apiUrl}/login`, payload);
  }

  // ====================== Permission Handling ======================


  // Read permission from session storage 
  // And convert to array of snake_case permissions (backend use snake_case, frontend use camelCase)
  getPermissions(): string[] {
    try {
      const raw = sessionStorage.getItem('permissions');
      if (!raw) return [];

      const perms = JSON.parse(raw);
      if (!Array.isArray(perms)) return [];

      return perms.map((p: string) =>
        p.replace(/([A-Z])/g, '_$1').toLowerCase()
      );
    } catch {
      return [];
    }
  }

  // checks if the user has a specific (one) permission
  can(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  // users need to have at least one of the permissions in the list to access
  canAny(permissions: string[]): boolean {
    return permissions.some(p => this.can(p));
  }

  // user must have all permissions in the list to access
  canAll(permissions: string[]): boolean {
    return permissions.every(p => this.can(p));
  }


}
