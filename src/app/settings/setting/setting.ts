import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideArrowLeft,
  LucideUser,
  LucideShieldCheck,
  LucideUsers,
  LucideTriangleAlert,
} from '@lucide/angular';

// Import Auth
import { AuthService } from '../../services/auth';

type IconType = typeof LucideUser | typeof LucideShieldCheck | typeof LucideUsers | typeof LucideTriangleAlert | typeof LucideArrowLeft;

interface SettingsNavItem {
  label: string;
  icon: IconType;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideDynamicIcon],
  templateUrl: './setting.html',
  styleUrl: './setting.scss'
})
export class Settings {

  protected readonly arrowLeftIcon: IconType = LucideArrowLeft;

  private readonly allNavItems: SettingsNavItem[] = [
    { label: 'Account', icon: LucideUser, route: 'account' },
    { label: 'Security', icon: LucideShieldCheck, route: 'security' },
    { label: 'User Management', icon: LucideUsers, route: 'user-management', adminOnly: true },
    { label: 'Danger Zone', icon: LucideTriangleAlert, route: 'danger-zone' },
  ];

  constructor(private router: Router, private authService: AuthService) {}

  protected get navItems(): SettingsNavItem[] {
    const isAdmin = this.authService.can('admin') || this.authService.canAny(['createUser', 'manageUsers']);
    return this.allNavItems.filter(item => !item.adminOnly || isAdmin);
  }

  protected goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}