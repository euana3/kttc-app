import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';

import { Settings } from './settings/setting/setting';
import { Account } from './settings/account/account';
import { Security } from './settings/security/security';
import { UserManagement } from './settings/user-management/user-management';
import { DangerZone } from './settings/danger-zone/danger-zone';


export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'dashboard', component: Dashboard },

  {
    path: 'settings',
    component: Settings,
    children: [
      { path: '', redirectTo: 'account', pathMatch: 'full' },
      { path: 'account', component: Account },
      { path: 'security', component: Security },
      { path: 'user-management', component: UserManagement },
      { path: 'danger-zone', component: DangerZone },
    ],
  },
];