import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService, CohortAnalysis as CohortAnalysisModel } from '../../../services/analytics';

@Component({
  selector: 'app-cohort-analysis',
  standalone: true,
  imports: [],
  templateUrl: './cohort-analysis.html',
  styleUrl: './cohort-analysis.scss'
})
export class CohortAnalysis implements OnInit {

  protected readonly analysis = signal<CohortAnalysisModel | null>(null);
  protected readonly loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit(): void {
    const batchId = Number(this.route.snapshot.paramMap.get('batchId'));

    this.analyticsService.getCohortAnalysis(batchId).subscribe({
      next: (analysis) => {
        this.analysis.set(analysis);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load cohort analysis', err);
        this.loading.set(false);
      },
    });
  }

  protected suggestionLines(suggestions: string | null): string[] {
    return this.analyticsService.suggestionLines(suggestions);
  }

  protected formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard/analytics']);
  }
}