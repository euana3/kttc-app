import { Component, OnInit, signal } from '@angular/core';
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
import { AnalyticsService, DashboardOverview } from '../../services/analytics';
import { BatchesService } from '../../services/batches';
import { CopilotWidgetService } from '../../services/copilot-widget';

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
  action?: 'navigate' | 'open-copilot';
  enabled: boolean;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss'
})
export class DashboardHome implements OnInit {

  protected readonly graduationCapIcon: IconType = LucideGraduationCap;
  protected readonly calendarIcon: IconType = LucideCalendar;
  protected readonly chartBarIcon: IconType = LucideChartBar;
  protected readonly checkIcon: IconType = LucideCheck;
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
      route: '/dashboard/trainees',
      action: 'navigate',
      enabled: true
    },
    {
      title: 'Trainer Dashboard',
      description: 'Manage training sessions, trainees, attendance and assessments.',
      icon: LucideUsers,
      color: 'purple',
      route: '/trainer',
      action: 'navigate',
      enabled: true
    },
    {
      title: 'Copilot',
      description: 'Ask questions and retrieve training information using natural language.',
      icon: LucideBot,
      color: 'cyan',
      action: 'open-copilot',
      enabled: true
    },
    {
      title: 'Alerts',
      description: 'View important training, course and user notifications.',
      icon: LucideBell,
      color: 'orange',
      route: '/alerts',
      action: 'navigate',
      enabled: true
    },
    {
      title: 'Recommendations',
      description: 'Get personalized training and learning recommendations.',
      icon: LucideLightbulb,
      color: 'green',
      route: '/recommendations',
      action: 'navigate',
      enabled: true
    },
    {
      title: 'Analytics',
      description: 'Analyze training performance, completion and assessment results.',
      icon: LucideChartBar,
      color: 'pink',
      route: '/dashboard/analytics',
      action: 'navigate',
      enabled: true
    },
    {
      title: 'Course Optimization',
      description: 'Analyze and optimize courses using training performance data.',
      icon: LucideSettings,
      color: 'yellow',
      route: '/course-optimization',
      action: 'navigate',
      enabled: true
    }
  ]);

  // ── Top summary stats ──────────────────────────────────────────────────
  protected readonly overview = signal<DashboardOverview | null>(null);
  protected readonly upcomingBatchCount = signal<number | null>(null);
  protected readonly summaryLoading = signal(true);

  constructor(
    private router: Router,
    private analyticsService: AnalyticsService,
    private batchesService: BatchesService,
    private copilotService: CopilotWidgetService,
  ) {}

  ngOnInit(): void {
    this.analyticsService.getDashboard().subscribe({
      next: (overview) => {
        this.overview.set(overview);
        this.summaryLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard overview', err);
        this.summaryLoading.set(false);
      },
    });

    this.batchesService.getAll('upcoming').subscribe({
      next: (batches) => this.upcomingBatchCount.set(batches.length),
      error: (err) => {
        console.error('Failed to load upcoming batches', err);
        this.upcomingBatchCount.set(null);
      },
    });
  }

  protected handleCardClick(card: DashboardCard): void {
    if (card.action === 'open-copilot') {
      if (!this.copilotService.open()) this.copilotService.toggle();
      return;
    }
    if (card.route) {
      this.router.navigate([card.route]);
    }
  }
}