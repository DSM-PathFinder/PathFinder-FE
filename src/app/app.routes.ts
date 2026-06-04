import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'onboarding',
        loadComponent: () =>
          import('./pages/onboarding/onboarding').then((m) => m.OnboardingComponent),
      },
      {
        path: 'generating',
        loadComponent: () =>
          import('./pages/generating/generating').then((m) => m.GeneratingComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'roadmap',
        loadComponent: () => import('./pages/roadmap/roadmap').then((m) => m.RoadmapComponent),
      },
      {
        path: 'notes',
        loadComponent: () => import('./pages/notes/notes').then((m) => m.NotesComponent),
      },
      {
        path: 'my',
        loadComponent: () => import('./pages/my-page/my-page').then((m) => m.MyPageComponent),
      },
      {
        path: 'community',
        loadComponent: () =>
          import('./pages/community/community').then((m) => m.CommunityComponent),
      },
    ],
  },
];
