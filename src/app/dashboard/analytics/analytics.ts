import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideDynamicIcon, LucideTriangleAlert } from '@lucide/angular';
import { AnalyticsService, DashboardOverview, AttentionItem } from '../../services/analytics';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [LucideDynamicIcon],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss'
})
export class Analytics implements OnInit {

  protected readonly triangleAlertIcon = LucideTriangleAlert;

  protected readonly overview = signal<DashboardOverview | null>(null);
  protected readonly attentionItems = signal<AttentionItem[]>([]);
  protected readonly loading = signal(true);

  constructor(
    private router: Router,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit(): void {
    this.analyticsService.getDashboard().subscribe({
      next: (overview) => {
        this.overview.set(overview);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load analytics dashboard', err);
        this.loading.set(false);
      },
    });

    this.analyticsService.getAttention().subscribe({
      next: (items) => this.attentionItems.set(items),
      error: (err) => console.error('Failed to load attention items', err),
    });
  }

  protected openAttentionItem(item: AttentionItem): void {
    if (item.type === 'module') {
      this.router.navigate(
        ['/dashboard/analytics/modules', item.id],
        item.batchId ? { queryParams: { batchId: item.batchId } } : {}
      );
    } else {
      this.router.navigate(['/dashboard/analytics/cohorts', item.id]);
    }
  }

  protected formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}