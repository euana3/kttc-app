import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  color: string;
  route?: string;
  enabled: boolean;
}

// type UserRole = 'Trainee' | 'Trainer' | 'Training Manager' | 'Admin';
type UserRole = 'Trainee' | 'Trainer' | 'Training Manager' | 'Admin';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

 protected readonly currentUser = signal('');
  protected readonly currentRole = signal<UserRole>('Trainee');


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

   ngOnInit(): void {
    this.loadUserFromSession();
  }

   private loadUserFromSession(): void {
    const fullname = sessionStorage.getItem('fullname');
    const username = sessionStorage.getItem('username');
    this.currentUser.set(fullname || username || 'Guest');

    const usergroups: string[] = JSON.parse(sessionStorage.getItem('usergroups') || '[]');
    this.currentRole.set(this.resolveRole(usergroups));
  }

  private resolveRole(usergroups: string[]): UserRole {
    const groups = usergroups.map(g => g.toLowerCase());

    if (groups.includes('admin')) return 'Admin';
    if (groups.includes('training manager') || groups.includes('trainingmanager')) return 'Training Manager';
    if (groups.includes('trainer')) return 'Trainer';
    return 'Trainee';
  }

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