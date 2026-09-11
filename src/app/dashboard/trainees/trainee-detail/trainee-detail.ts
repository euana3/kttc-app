import { Component, ElementRef, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TraineesService, TraineeBatchDetail } from '../../../services/trainees';
import { AttemptsService } from '../../../services/attempts';

interface PlannedMetricCategory {
  title: string;
  items: string[];
}

@Component({
  selector: 'app-trainee-detail',
  standalone: true,
  imports: [],
  templateUrl: './trainee-detail.html',
  styleUrl: './trainee-detail.scss'
})
export class TraineeDetail implements OnInit, OnDestroy {

  protected readonly today = signal(new Date());
  protected readonly detail = signal<TraineeBatchDetail | null>(null);
  protected readonly loading = signal(true);
  protected batchId!: number;
  protected traineeId!: number;

  protected readonly streamCanvas = viewChild<ElementRef<HTMLCanvasElement>>('streamCanvas');
  protected readonly streamConnected = signal(false);

  private liveSocket: WebSocket | null = null;

  // Reference only — not yet backed by any API endpoint. Planning diagram for
  // per-trainee analytics. Do not wire this to real data until an endpoint exists.
  protected readonly plannedMetrics = signal<PlannedMetricCategory[]>([
    {
      title: 'Progress Metrics',
      items: [
        'Completion rate',
        'Failure point — where trainees fail at, and out of course',
        'Enrolment data',
      ],
    },
    {
      title: 'Feedback Metrics',
      items: [
        'Satisfaction score',
        'Comment analysis',
      ],
    },
    {
      title: 'Engagement Metrics',
      items: [
        'Time spent',
        'Click rate: interaction with tutorial',
        'Idle time',
        'Self rating',
        'Learning pattern',
      ],
    },
    {
      title: 'Performance Metrics',
      items: [
        'Quiz scores',
        'Pass/fail rate',
        'Error frequency',
        'Safety violations',
        'Hints',
      ],
    },
    {
      title: 'Quality and Error',
      items: [
        'Total time taken',
        'Time spent per step',
        'Time spent reading instructions',
        'Time spent executing',
        'Number of attempts before perfect run',
        'Post-training failure rate',
        'Trainer',
        'Trainer-to-student ratio',
        'Physical interventions',
      ],
    },
    {
      title: 'LLM Generated Description',
      items: [
        'Narrative summary of trainee performance, auto-generated once available',
      ],
    },
    {
      title: 'Competency Matrix',
      items: [
        'Skill-by-skill competency breakdown',
      ],
    },
  ]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private traineesService: TraineesService,
    private attemptsService: AttemptsService,
  ) {}

  ngOnInit(): void {
    this.batchId = Number(this.route.snapshot.paramMap.get('batchId'));
    this.traineeId = Number(this.route.snapshot.paramMap.get('traineeId'));

    this.traineesService.getBatchDetail(this.traineeId, this.batchId).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.loading.set(false);
        if (detail.live_event_log) {
          this.connectLiveSocket(detail.live_event_log.attempt_id);
        }
      },
      error: (err) => {
        console.error('Failed to load trainee detail', err);
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.liveSocket?.close();
  }

  private connectLiveSocket(attemptId: number): void {
    this.liveSocket = this.attemptsService.connectLive(attemptId);

    this.liveSocket.onmessage = (msg) => {
      let payload: any;
      try {
        payload = JSON.parse(msg.data);
      } catch {
        console.warn('Received non-JSON live message', msg.data);
        return;
      }

      if (payload?.type === 'event' && payload.event) {
        this.detail.update(current => {
          if (!current?.live_event_log) return current;
          return {
            ...current,
            live_event_log: {
              ...current.live_event_log,
              events: [...current.live_event_log.events, payload.event],
            },
          };
        });
      } else {
        console.log('Unhandled live message type', payload);
      }
    };

    this.liveSocket.onerror = (err) => {
      console.error('Live event socket error', err);
    };
  }

  protected statusBadgeClass(status: string): string {
    if (status === 'completed') return 'completed';
    if (status === 'in_progress') return 'in-progress';
    if (status === 'failed') return 'failed';
    return 'todo';
  }

  protected statusLabel(status: string): string {
    if (status === 'completed') return 'COMPLETED';
    if (status === 'in_progress') return 'IN PROGRESS';
    if (status === 'failed') return 'FAILED';
    return 'TO DO';
  }

  protected openAttempt(attemptId: number | null): void {
    if (!attemptId) return;
    this.router.navigate(['/dashboard/trainees/attempts', attemptId]);
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard/trainees/batches', this.batchId]);
  }
}