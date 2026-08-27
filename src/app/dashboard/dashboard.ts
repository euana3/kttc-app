import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  color: string;
  route?: string;
  enabled: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

  protected readonly currentUser = signal('John Doe');

  protected readonly currentRole = signal<
    'Trainee' | 'Trainer' | 'Training Manager' | 'Admin'
  >('Trainee');

  protected readonly dashboardCards = signal<DashboardCard[]>([
    {
      title: 'Trainee Dashboard',
      description: 'View your courses, progress, assessments and upcoming training.',
      icon: '🎓',
      color: 'blue',
      route: '/trainee',
      enabled: true
    },
    {
      title: 'Trainer Dashboard',
      description: 'Manage training sessions, trainees, attendance and assessments.',
      icon: '👨‍🏫',
      color: 'purple',
      route: '/trainer',
      enabled: true
    },
    {
      title: 'Copilot',
      description: 'Ask questions and retrieve training information using natural language.',
      icon: '🤖',
      color: 'cyan',
      route: '/copilot',
      enabled: true
    },
    {
      title: 'Alerts',
      description: 'View important training, course and user notifications.',
      icon: '🔔',
      color: 'orange',
      route: '/alerts',
      enabled: true
    },
    {
      title: 'Recommendations',
      description: 'Get personalized training and learning recommendations.',
      icon: '💡',
      color: 'green',
      route: '/recommendations',
      enabled: true
    },
    {
      title: 'Reports',
      description: 'Analyze training performance, completion and assessment results.',
      icon: '📊',
      color: 'pink',
      route: '/reports',
      enabled: true
    },
    {
      title: 'Course Optimization',
      description: 'Analyze and optimize courses using training performance data.',
      icon: '⚙️',
      color: 'yellow',
      route: '/course-optimization',
      enabled: true
    }
  ]);

  constructor(private router: Router) {}

  protected navigateTo(route?: string): void {
    if (!route) {
      return;
    }

    this.router.navigate([route]);
  }

  protected logout(): void {
    this.router.navigate(['/login']);
  }
}