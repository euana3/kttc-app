import { Component, ElementRef, computed, effect, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TraineesService, TraineeBatchDetail } from '../../../services/trainees';
import { AttemptsService } from '../../../services/attempts';
import { environment } from '../../../environment/environment';

type StreamState = 'connecting' | 'connected' | 'disconnected';

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

  // ── Live video stream ────────────────────────────────────────────────────
  protected readonly streamCanvas = viewChild<ElementRef<HTMLCanvasElement>>('streamCanvas');

  protected readonly streamState = signal<StreamState>('connecting');
  protected readonly streamConnected = computed(() => this.streamState() === 'connected');

  protected readonly streamStateLabel = computed(() => {
    switch (this.streamState()) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting…';
      default: return 'Not connected';
    }
  });

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
  ) {
    // The canvas only exists after the detail loads AND the live block renders,
    // so we react to the viewChild signal instead of connecting in ngOnInit.
    effect((onCleanup) => {
      const canvasRef = this.streamCanvas();
      if (!canvasRef) return;

      const stop = this.startVideoStream(canvasRef.nativeElement);
      onCleanup(stop); // closes the socket when the canvas disappears or the component is destroyed
    });
  }

  ngOnInit(): void {
    this.batchId = Number(this.route.snapshot.paramMap.get('batchId'));
    this.traineeId = Number(this.route.snapshot.paramMap.get('traineeId'));

    // ── TEMPORARY MOCK (for testing the video without the backend) ──────────
    // To use it: comment out the whole getBatchDetail(...) block below and
    // uncomment these lines. Reverse this when your backend is available.
    //
    // this.detail.set({
    //   trainee: { id: 1, name: 'Trainee 1' },
    //   overall_stats: { avg_time_per_session: '18 min' },
    //   learning_path: [],
    //   live_event_log: { attempt_id: 1, events: [] },
    // } as any);
    // this.loading.set(false);
    // return;

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

  // Event-log socket (JSON messages from the Fastify backend)
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

  // Video socket (binary JPEG frames from the Python server)
  private startVideoStream(canvas: HTMLCanvasElement): () => void {
    const ctx = canvas.getContext('2d');
    let ws: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    let decoding = false;

    const connect = () => {
      this.streamState.set('connecting');            // yellow
      ws = new WebSocket(environment.streamUrl);
      ws.binaryType = 'blob';                        // each message is one JPEG

      ws.onmessage = async (event) => {
        // Drop frames that arrive while the previous one is still decoding,
        // so the picture never falls behind real time.
        if (decoding || !ctx) return;
        decoding = true;
        try {
          const bitmap = await createImageBitmap(event.data as Blob);
          if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
          }
          ctx.drawImage(bitmap, 0, 0);
          bitmap.close();

          if (this.streamState() !== 'connected') this.streamState.set('connected');   // green
        } catch (err) {
          console.warn('Could not decode video frame', err);
        } finally {
          decoding = false;
        }
      };

      ws.onerror = () => ws?.close();

      ws.onclose = () => {
        if (stopped) return;
        this.streamState.set('disconnected');        // red
        retryTimer = setTimeout(connect, 2000);      // goes back to yellow when it retries
      };
    };

    connect();

    // Cleanup function returned to the effect
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      ws?.close();
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