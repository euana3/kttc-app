import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideHouse,
  LucideGraduationCap,
  LucideUsers,
  LucideBookOpen,
  LucideCalendar,
  LucideChartBar,
  LucideSettings,
  LucideLogOut,
  LucideBell,
  LucideBot,
  LucideLightbulb,
  LucideTriangleAlert,
  LucideCircleAlert,
  LucideInfo,
  LucideCheck,
} from '@lucide/angular';

type UserRole = 'Trainee' | 'Trainer' | 'Training Manager' | 'Admin';

// The type of any Lucide icon component class (e.g. LucideHouse, LucideUsers, etc.)
type IconType = typeof LucideHouse | 
typeof LucideGraduationCap | 
typeof LucideUsers | 
typeof LucideBookOpen | 
typeof LucideCalendar | 
typeof LucideChartBar | 
typeof LucideSettings | 
typeof LucideLogOut |
typeof LucideBell | 
typeof LucideBot |
typeof LucideLightbulb | 
typeof LucideTriangleAlert | 
typeof LucideCircleAlert | 
typeof LucideInfo | 
typeof LucideCheck ;

interface DashboardCard {
  title: string;
  description: string;
  icon: IconType;
  color: string;
  route?: string;
  enabled: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  protected readonly currentUser = signal('');
  protected readonly currentRole = signal<UserRole>('Trainee');

  // Icons used directly in the template (sidebar, header, alerts, etc.)
  protected readonly houseIcon: IconType = LucideHouse;
  protected readonly graduationCapIcon: IconType = LucideGraduationCap;
  protected readonly usersIcon: IconType = LucideUsers;
  protected readonly bookOpenIcon: IconType = LucideBookOpen;
  protected readonly calendarIcon: IconType = LucideCalendar;
  protected readonly chartBarIcon: IconType = LucideChartBar;
  protected readonly settingsIcon: IconType = LucideSettings;
  protected readonly logoutIcon: IconType = LucideLogOut;
  protected readonly bellIcon: IconType = LucideBell;
  protected readonly botIcon: IconType = LucideBot;
  protected readonly checkIcon: IconType = LucideCheck;
  protected readonly lightbulbIcon: IconType = LucideLightbulb;
  protected readonly triangleAlertIcon: IconType = LucideTriangleAlert;
  protected readonly circleAlertIcon: IconType = LucideCircleAlert;
  protected readonly infoIcon: IconType = LucideInfo;

  protected readonly dashboardCards = signal<DashboardCard[]>([
    {
      title: 'Trainee Dashboard',
      description: 'View your courses, progress, assessments and upcoming training.',
      icon: LucideGraduationCap,
      color: 'blue',
      route: '/trainee',
      enabled: true
    },
    {
      title: 'Trainer Dashboard',
      description: 'Manage training sessions, trainees, attendance and assessments.',
      icon: LucideUsers,
      color: 'purple',
      route: '/trainer',
      enabled: true
    },
    {
      title: 'Copilot',
      description: 'Ask questions and retrieve training information using natural language.',
      icon: LucideBot,
      color: 'cyan',
      route: '/copilot',
      enabled: true
    },
    {
      title: 'Alerts',
      description: 'View important training, course and user notifications.',
      icon: LucideBell,
      color: 'orange',
      route: '/alerts',
      enabled: true
    },
    {
      title: 'Recommendations',
      description: 'Get personalized training and learning recommendations.',
      icon: LucideLightbulb,
      color: 'green',
      route: '/recommendations',
      enabled: true
    },
    {
      title: 'Reports',
      description: 'Analyze training performance, completion and assessment results.',
      icon: LucideChartBar,
      color: 'pink',
      route: '/reports',
      enabled: true
    },
    {
      title: 'Course Optimization',
      description: 'Analyze and optimize courses using training performance data.',
      icon: LucideSettings,
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
    if (!route) return;
    this.router.navigate([route]);
  }

  protected logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}