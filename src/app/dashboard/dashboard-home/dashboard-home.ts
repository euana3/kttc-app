import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideGraduationCap,
  LucideUsers,
  LucideBookOpen,
  LucideCalendar,
  LucideChartBar,
  LucideSettings,
  LucideBot,
  LucideBell,
  LucideCheck,
  LucideLightbulb,
  LucideTriangleAlert,
  LucideCircleAlert,
  LucideInfo,
} from '@lucide/angular';

type IconType =
  | typeof LucideGraduationCap
  | typeof LucideUsers
  | typeof LucideBookOpen
  | typeof LucideCalendar
  | typeof LucideChartBar
  | typeof LucideSettings
  | typeof LucideBot
  | typeof LucideBell
  | typeof LucideCheck
  | typeof LucideLightbulb
  | typeof LucideTriangleAlert
  | typeof LucideCircleAlert
  | typeof LucideInfo;

interface DashboardCard {
  title: string;
  description: string;
  icon: IconType;
  color: string;
  route?: string;
  enabled: boolean;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss'
})
export class DashboardHome {

  protected readonly graduationCapIcon: IconType = LucideGraduationCap;
  protected readonly calendarIcon: IconType = LucideCalendar;
  protected readonly chartBarIcon: IconType = LucideChartBar;
  protected readonly checkIcon: IconType = LucideCheck;
  protected readonly botIcon: IconType = LucideBot;
  protected readonly bookOpenIcon: IconType = LucideBookOpen;
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

  protected navigateTo(route?: string): void {
    if (!route) return;
    this.router.navigate([route]);
  }
}