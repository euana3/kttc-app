import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import { ChatService, ChatMessage } from '../../services/chat';

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
  imports: [LucideDynamicIcon, FormsModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss'
})
export class DashboardHome implements OnInit {

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
      route: '/dashboard/trainees',
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

  // Copilot quick-ask widget state
  protected readonly chatMessages = signal<ChatMessage[]>([]);
  protected readonly chatDraft = signal('');
  protected readonly sendingMessage = signal(false);
  protected readonly chatError = signal<string | null>(null);

  constructor(private router: Router, private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getHistory().subscribe({
      next: (messages) => {
        // Show only the most recent exchange on the dashboard widget — a full
        // transcript view belongs on the dedicated Copilot page (/copilot).
        this.chatMessages.set(messages.slice(-4));
      },
      error: (err) => console.error('Failed to load chat history', err),
    });
  }

  protected navigateTo(route?: string): void {
    if (!route) return;
    this.router.navigate([route]);
  }

  protected askCopilot(): void {
    const message = this.chatDraft().trim();
    if (!message || this.sendingMessage()) return;

    this.sendingMessage.set(true);
    this.chatError.set(null);

    // Show the user's message immediately rather than waiting on the round trip
    const optimisticUserMsg: ChatMessage = {
      id: -Date.now(),
      trainer_id: null,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };
    this.chatMessages.update(msgs => [...msgs, optimisticUserMsg].slice(-4));
    this.chatDraft.set('');

    this.chatService.sendMessage({ message }).subscribe({
      next: (reply) => {
        this.chatMessages.update(msgs => [...msgs, reply].slice(-4));
        this.sendingMessage.set(false);
      },
      error: (err) => {
        console.error('Copilot request failed', err);
        this.chatError.set('Copilot is unavailable right now — try again shortly.');
        this.sendingMessage.set(false);
      },
    });
  }
}