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

import { Trainees } from './dashboard/trainees/trainees';
import { BatchDetail } from './dashboard/trainees/batch-detail/batch-detail';
import { TraineeDetail } from './dashboard/trainees/trainee-detail/trainee-detail';
import { AttemptDetail } from './dashboard/trainees/attempt-detail/attempt-detail';

import { Analytics } from './dashboard/analytics/analytics';
import { ModuleAnalysis } from './dashboard/analytics/module-analysis/module-analysis';
import { CohortAnalysis } from './dashboard/analytics/cohort-analysis/cohort-analysis';

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

      { path: 'trainees', component: Trainees },
      { path: 'trainees/batches/:batchId', component: BatchDetail },
      { path: 'trainees/batches/:batchId/trainee/:traineeId', component: TraineeDetail },
      { path: 'trainees/attempts/:attemptId', component: AttemptDetail },

      { path: 'analytics', loadComponent: () => import('./dashboard/analytics/analytics').then(m => m.Analytics) },
      { path: 'analytics/modules/:moduleId', loadComponent: () => import('./dashboard/analytics/module-analysis/module-analysis').then(m => m.ModuleAnalysis) },
      { path: 'analytics/cohorts/:batchId', loadComponent: () => import('./dashboard/analytics/cohort-analysis/cohort-analysis').then(m => m.CohortAnalysis) },
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