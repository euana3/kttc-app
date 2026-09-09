import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AttemptsService, AttemptDetail as AttemptDetailModel } from '../../../services/attempts';

@Component({
  selector: 'app-attempt-detail',
  standalone: true,
  imports: [],
  templateUrl: './attempt-detail.html',
  styleUrl: './attempt-detail.scss'
})
export class AttemptDetail implements OnInit {

  protected readonly today = signal(new Date());
  protected readonly attempt = signal<AttemptDetailModel | null>(null);
  protected readonly loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private attemptsService: AttemptsService,
  ) {}

  ngOnInit(): void {
    const attemptId = Number(this.route.snapshot.paramMap.get('attemptId'));

    this.attemptsService.getById(attemptId).subscribe({
      next: (detail) => {
        this.attempt.set(detail);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load attempt detail', err);
        this.loading.set(false);
      },
    });
  }

  protected totalScore(indicators: { score: number | null }[]): number {
    const scores = indicators.map(i => i.score ?? 0);
    return scores.reduce((sum, s) => sum + s, 0);
  }

  protected suggestionLines(suggestions: string | null): string[] {
    if (!suggestions) return [];
    return suggestions.split('\n').filter(line => line.trim().length > 0);
  }
}