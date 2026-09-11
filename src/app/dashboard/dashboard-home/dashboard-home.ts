import { Component, ElementRef, OnInit, signal, viewChild } from '@angular/core';
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
  action?: 'navigate' | 'scroll'; // 'scroll' targets a section already on this page
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
      action: 'scroll', // scrolls to .copilot-card further down this same page
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
      title: 'Analytics',
      description: 'Analyze training performance, completion and assessment results.',
      icon: LucideChartBar,
      color: 'pink',
      route: '/dashboard/analytics',
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

  protected readonly chatMessages = signal<ChatMessage[]>([]);
  protected readonly chatDraft = signal('');
  protected readonly sendingMessage = signal(false);
  protected readonly chatError = signal<string | null>(null);

  private readonly copilotSection = viewChild<ElementRef<HTMLElement>>('copilotSection');

  constructor(private router: Router, private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getHistory().subscribe({
      next: (messages) => {
        this.chatMessages.set(messages.slice(-4));
      },
      error: (err) => console.error('Failed to load chat history', err),
    });
  }

  protected handleCardClick(card: DashboardCard): void {
    if (card.action === 'scroll') {
      this.scrollToCopilot();
      return;
    }
    if (card.route) {
      this.router.navigate([card.route]);
    }
  }

  private scrollToCopilot(): void {
    this.copilotSection()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected newChat(): void {
    this.chatMessages.set([]);
    this.chatDraft.set('');
    this.chatError.set(null);
    this.sendingMessage.set(false);
  }

  protected askCopilot(): void {
    const message = this.chatDraft().trim();
    if (!message || this.sendingMessage()) return;

    this.sendingMessage.set(true);
    this.chatError.set(null);

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