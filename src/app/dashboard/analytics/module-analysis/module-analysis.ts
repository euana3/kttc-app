import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnalyticsService, ModuleAnalysis as ModuleAnalysisModel } from '../../../services/analytics';

@Component({
  selector: 'app-module-analysis',
  standalone: true,
  imports: [],
  templateUrl: './module-analysis.html',
  styleUrl: './module-analysis.scss'
})
export class ModuleAnalysis implements OnInit {

  protected readonly analysis = signal<ModuleAnalysisModel | null>(null);
  protected readonly loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit(): void {
    const moduleId = Number(this.route.snapshot.paramMap.get('moduleId'));
    const batchIdParam = this.route.snapshot.queryParamMap.get('batchId');
    const batchId = batchIdParam ? Number(batchIdParam) : undefined;

    this.analyticsService.getModuleAnalysis(moduleId, batchId).subscribe({
      next: (analysis) => {
        this.analysis.set(analysis);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load module analysis', err);
        this.loading.set(false);
      },
    });
  }

  protected suggestionLines(suggestions: string | null): string[] {
    return this.analyticsService.suggestionLines(suggestions);
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard/analytics']);
  }
}