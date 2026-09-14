import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePassword } from '../change-password/change-password';
import { SessionLogService, SessionEvent } from './../../services/session-log';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, ChangePassword],
  templateUrl: './security.html',
  styleUrl: './security.scss'
})
export class Security {

  protected loginHistory: SessionEvent[] = [];
  protected currentSessionStart: string | null = null;

  constructor(private sessionLog: SessionLogService) {
    this.loginHistory = this.sessionLog.getLoginHistory();
    this.currentSessionStart = this.sessionLog.getCurrentSessionStart();
  }

  protected formatTimestamp(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  protected clearHistory(): void {
    this.sessionLog.clear();
    this.loginHistory = [];
    this.currentSessionStart = null;
  }
}