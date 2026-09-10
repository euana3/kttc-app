import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BatchesService, BatchDetail as BatchDetailModel, BatchModuleProgress, BatchTraineeProgress } from '../../../services/batches';

@Component({
  selector: 'app-batch-detail',
  standalone: true,
  imports: [],
  templateUrl: './batch-detail.html',
  styleUrl: './batch-detail.scss'
})
export class BatchDetail implements OnInit {

  protected readonly today = signal(new Date());
  protected readonly batch = signal<BatchDetailModel | null>(null);
  protected readonly loading = signal(true);
  protected batchId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private batchesService: BatchesService,
  ) {}

  ngOnInit(): void {
    this.batchId = Number(this.route.snapshot.paramMap.get('batchId'));

    this.batchesService.getById(this.batchId).subscribe({
      next: (detail) => {
        this.batch.set(detail);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load batch detail', err);
        this.loading.set(false);
      },
    });
  }

  protected statusClass(status: string): string {
    return status;
  }

  protected openTrainee(traineeId: number): void {
    this.router.navigate(['/dashboard/trainees/batches', this.batchId, 'trainee', traineeId]);
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard/trainees']);
  }
}