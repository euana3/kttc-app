import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BatchesService, BatchWithCourseName } from '../../services/batches';

@Component({
  selector: 'app-trainees',
  standalone: true,
  imports: [],
  templateUrl: './trainees.html',
  styleUrl: './trainees.scss'
})
export class Trainees implements OnInit {

  protected readonly today = signal(new Date());
  protected readonly batches = signal<BatchWithCourseName[]>([]);
  protected readonly loading = signal(true);

  constructor(
    private router: Router,
    private batchesService: BatchesService,
  ) {}

  ngOnInit(): void {
    this.batchesService.getAll().subscribe({
      next: (batches: any) => {
        this.batches.set(batches);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load batches', err);
        this.loading.set(false);
      },
    });
  }

  protected formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
  }

  protected openBatch(batchId: number): void {
    this.router.navigate(['/dashboard/trainees/batches', batchId]);
  }
}