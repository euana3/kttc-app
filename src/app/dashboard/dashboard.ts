import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideHouse,
  LucideGraduationCap,
  LucideUsers,
  LucideBookOpen,
  LucideCalendar,
  LucideChartBar,
  LucideSettings,
  LucideLogOut,
  LucideBell,
} from '@lucide/angular';

type UserRole = 'Trainee' | 'Trainer' | 'Training Manager' | 'Admin';

type IconType =
  | typeof LucideHouse
  | typeof LucideGraduationCap
  | typeof LucideUsers
  | typeof LucideBookOpen
  | typeof LucideCalendar
  | typeof LucideChartBar
  | typeof LucideSettings
  | typeof LucideLogOut
  | typeof LucideBell;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideDynamicIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  protected readonly currentUser = signal('');
  protected readonly currentRole = signal<UserRole>('Trainee');

  protected readonly houseIcon: IconType = LucideHouse;
  protected readonly graduationCapIcon: IconType = LucideGraduationCap;
  protected readonly usersIcon: IconType = LucideUsers;
  protected readonly bookOpenIcon: IconType = LucideBookOpen;
  protected readonly calendarIcon: IconType = LucideCalendar;
  protected readonly chartBarIcon: IconType = LucideChartBar;
  protected readonly settingsIcon: IconType = LucideSettings;
  protected readonly logoutIcon: IconType = LucideLogOut;
  protected readonly bellIcon: IconType = LucideBell;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserFromSession();
  }

  private loadUserFromSession(): void {
    const fullname = sessionStorage.getItem('fullname');
    const username = sessionStorage.getItem('username');
    this.currentUser.set(fullname || username || 'Guest');

    const usergroups: string[] = JSON.parse(sessionStorage.getItem('usergroups') || '[]');
    this.currentRole.set(this.resolveRole(usergroups));
  }

  private resolveRole(usergroups: string[]): UserRole {
    const groups = usergroups.map(g => g.toLowerCase());
    if (groups.includes('admin')) return 'Admin';
    if (groups.includes('training manager') || groups.includes('trainingmanager')) return 'Training Manager';
    if (groups.includes('trainer')) return 'Trainer';
    return 'Trainee';
  }

  protected navigateTo(route?: string): void {
    if (!route) return;
    this.router.navigate([route]);
  }

  protected logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}