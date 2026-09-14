import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

export type SessionEventType = 'login' | 'navigation';

export interface SessionEvent {
  type: SessionEventType;
  path?: string;      // for navigation events
  user?: string;       // for login events, e.g. username/email
  timestamp: string;
}

const STORAGE_KEY = 'lms_session_log';
const MAX_ENTRIES = 200; // avoid unbounded localStorage growth

// FAKE / DEMO ONLY. There is no real backend-tracked session or login history
// endpoint. This service fabricates a client-side approximation using
// localStorage, scoped to a single browser — it does NOT reflect real
// server-side sessions, clears if localStorage is cleared, and means nothing
// across devices or incognito windows. Replace with real backend-tracked
// sessions if/when a proper endpoint exists.
@Injectable({
  providedIn: 'root',
})
export class SessionLogService {

  constructor(private router: Router) {
    // Track every completed navigation automatically from the moment this
    // singleton is instantiated (wired into app.ts).
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.record({ type: 'navigation', path: e.urlAfterRedirects }));
  }

  recordLogin(user?: string): void {
    this.record({ type: 'login', user });
  }

  private record(partial: Omit<SessionEvent, 'timestamp'>): void {
    const event: SessionEvent = { ...partial, timestamp: new Date().toISOString() };
    const all = this.getAll();
    all.push(event);
    // keep only the most recent MAX_ENTRIES
    const trimmed = all.slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }

  getAll(): SessionEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  getLoginHistory(): SessionEvent[] {
    return this.getAll().filter(e => e.type === 'login').reverse(); // most recent first
  }

  getNavigationHistory(): SessionEvent[] {
    return this.getAll().filter(e => e.type === 'navigation').reverse();
  }

  /**
   * "Active session" is a fiction here — there's no server session to check.
   * This just reports the most recent login timestamp as if it were an
   * ongoing session, since there's no logout tracking either.
   */
  getCurrentSessionStart(): string | null {
    const logins = this.getLoginHistory();
    return logins.length > 0 ? logins[0].timestamp : null;
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}