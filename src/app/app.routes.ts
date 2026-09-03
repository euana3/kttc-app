import { Routes } from '@angular/router';
import { Login } from './login/login';

import { Dashboard } from './dashboard/dashboard';
import { DashboardHome } from './dashboard/dashboard-home/dashboard-home';
import { Courses } from './dashboard/courses/courses';
import { CreateCourse } from './dashboard/courses/create-course/create-course';
import { CreateModule } from './dashboard/courses/create-module/create-module';

import { Settings } from './settings/setting/setting';
import { Account } from './settings/account/account';
import { Security } from './settings/security/security';
import { UserManagement } from './settings/user-management/user-management';
import { DangerZone } from './settings/danger-zone/danger-zone';


export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      { path: '', component: DashboardHome },
      { path: 'courses', component: Courses },
      { path: 'courses/new', component: CreateCourse },
      { path: 'modules/new', component: CreateModule },
    ],
  },

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