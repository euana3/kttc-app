import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideDynamicIcon,
  LucideGraduationCap,
  LucideCheckCircle,
  LucideTriangleAlert,
  LucideAward,
  LucideBarChart3,
  LucideLayers,
  LucideTarget,
  LucideClock,
  LucideUsers,
  LucideBookOpen,
  LucideCalendar,
  LucideBell,
  LucideSearch,
} from '@lucide/angular';
import { BatchesService, BatchDetail, BatchWithCourseName } from '../../services/batches';

type IconType =
  | typeof LucideGraduationCap | typeof LucideCheckCircle | typeof LucideTriangleAlert
  | typeof LucideAward | typeof LucideBarChart3 | typeof LucideLayers
  | typeof LucideTarget | typeof LucideClock | typeof LucideUsers | typeof LucideBookOpen
  | typeof LucideCalendar | typeof LucideBell | typeof LucideSearch;

interface ModuleProgress {
  id: number;
  name: string;
  avg_progress: number;
}

interface RosterTrainee {
  id: number;
  name: string;
  progress: number;
  status: 'live' | 'attention' | 'ok';
}

type RiskFilter = 'all' | 'attention' | 'ok';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [LucideDynamicIcon, FormsModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss'
})
export class DashboardHome implements OnInit {

  protected readonly graduationCapIcon: IconType = LucideGraduationCap;
  protected readonly checkCircleIcon: IconType = LucideCheckCircle;
  protected readonly alertIcon: IconType = LucideTriangleAlert;
  protected readonly awardIcon: IconType = LucideAward;
  protected readonly barChartIcon: IconType = LucideBarChart3;
  protected readonly layersIcon: IconType = LucideLayers;
  protected readonly targetIcon: IconType = LucideTarget;
  protected readonly clockIcon: IconType = LucideClock;
  protected readonly usersIcon: IconType = LucideUsers;
  protected readonly bookOpenIcon: IconType = LucideBookOpen;
  protected readonly calendarIcon: IconType = LucideCalendar;
  protected readonly bellIcon: IconType = LucideBell;
  protected readonly searchIcon: IconType = LucideSearch;

  // ── Batch selector ──────────────────────────────────────────────────────
  protected readonly batches = signal<BatchWithCourseName[]>([]);
  protected readonly selectedBatchId = signal<number | null>(null);
  protected readonly loadingBatches = signal(true);

  // ── Real data: funnel + roster (scoped to selected batch) ───────────────
  protected readonly modules = signal<ModuleProgress[]>([]);
  protected readonly roster = signal<RosterTrainee[]>([]);
  protected readonly loadingDetail = signal(true);
  protected readonly loadError = signal('');

  // ── Roster filtering ──────────────────────────────────────────────────
  protected readonly searchTerm = signal('');
  protected readonly riskFilter = signal<RiskFilter>('all');

  protected readonly filteredRoster = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const risk = this.riskFilter();
    return this.roster().filter(t => {
      const matchesTerm = !term || t.name.toLowerCase().includes(term);
      const matchesRisk = risk === 'all' || t.status === risk;
      return matchesTerm && matchesRisk;
    });
  });

  protected readonly atRiskCount = computed(() =>
    this.roster().filter(t => t.status === 'attention').length
  );

  protected readonly avgModuleCompletion = computed(() => {
    const mods = this.modules();
    if (!mods.length) return null;
    return Math.round(mods.reduce((sum, m) => sum + m.avg_progress, 0) / mods.length);
  });

  constructor(private batchesService: BatchesService) {}

  ngOnInit(): void {
    // Lists every batch for the selector. If your BatchesService.getAll()
    // requires a status argument, call it as getAll(undefined) instead.
    this.batchesService.getAll().subscribe({
      next: (batches) => {
        this.batches.set(batches);
        this.loadingBatches.set(false);
        if (batches.length) {
          this.selectedBatchId.set(batches[0].id);
          this.loadBatch(batches[0].id);
        } else {
          this.loadingDetail.set(false);
        }
      },
      error: () => {
        this.loadingBatches.set(false);
        this.loadingDetail.set(false);
        this.loadError.set('Could not load batches.');
      },
    });
  }

  protected onBatchChange(id: number): void {
    this.selectedBatchId.set(id);
    this.loadBatch(id);
  }

  private loadBatch(id: number): void {
    this.loadingDetail.set(true);
    this.loadError.set('');

    // BatchesService.getById() remaps the raw backend shape into
    // module_progress[] / trainee_progress[] for batch-detail.html, so we
    // translate it back into the flatter shape this dashboard renders.
    this.batchesService.getById(id).subscribe({
      next: (detail: BatchDetail) => {
        this.modules.set(
          detail.module_progress.map(m => ({
            id: m.module_id,
            name: m.module_name,
            avg_progress: m.average_progress_percent,
          }))
        );
        this.roster.set(
          detail.trainee_progress.map(t => ({
            id: t.trainee.id,
            name: t.trainee.name,
            progress: t.progress_percent,
            status: t.status,
          }))
        );
        this.loadingDetail.set(false);
      },
      error: () => {
        this.loadingDetail.set(false);
        this.loadError.set('Could not load batch detail.');
      },
    });
  }

  protected isLive(status: string): boolean {
    return status === 'live';
  }

  protected riskLabel(status: string): string {
    if (status === 'live') return 'Unknown'; // backend doesn't compute risk for live trainees
    if (status === 'attention') return 'High Risk';
    return 'Low Risk';
  }

  protected riskClass(status: string): string {
    if (status === 'live') return 'unknown';
    if (status === 'attention') return 'high';
    return 'low';
  }
}