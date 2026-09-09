import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TraineesService, TraineeBatchDetail } from '../../../services/trainees';

@Component({
  selector: 'app-trainee-detail',
  standalone: true,
  imports: [],
  templateUrl: './trainee-detail.html',
  styleUrl: './trainee-detail.scss'
})
export class TraineeDetail implements OnInit {

  protected readonly today = signal(new Date());
  protected readonly detail = signal<TraineeBatchDetail | null>(null);
  protected readonly loading = signal(true);
  protected batchId!: number;
  protected traineeId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private traineesService: TraineesService,
  ) {}

  ngOnInit(): void {
    this.batchId = Number(this.route.snapshot.paramMap.get('batchId'));
    this.traineeId = Number(this.route.snapshot.paramMap.get('traineeId'));

    this.traineesService.getBatchDetail(this.traineeId, this.batchId).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load trainee detail', err);
        this.loading.set(false);
      },
    });
  }

  protected statusBadgeClass(status: string): string {
    if (status === 'completed') return 'completed';
    if (status === 'in_progress') return 'in-progress';
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
}