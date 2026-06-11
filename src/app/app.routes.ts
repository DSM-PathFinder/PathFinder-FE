import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout';
import { authGuard } from './guards/auth.guard';

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
        path: 'auth/callback',
        loadComponent: () =>
          import('./pages/auth-callback/auth-callback').then((m) => m.AuthCallbackComponent),
      },
      {
        path: 'onboarding',
        loadComponent: () =>
          import('./pages/onboarding/onboarding').then((m) => m.OnboardingComponent),
        canActivate: [authGuard],
      },
      {
        path: 'generating',
        loadComponent: () =>
          import('./pages/generating/generating').then((m) => m.GeneratingComponent),
        canActivate: [authGuard],
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
        canActivate: [authGuard],
      },
      {
        path: 'roadmap',
        loadComponent: () => import('./pages/roadmap/roadmap').then((m) => m.RoadmapComponent),
        canActivate: [authGuard],
      },
      {
        path: 'notes',
        loadComponent: () => import('./pages/notes/notes').then((m) => m.NotesComponent),
        canActivate: [authGuard],
      },
      {
        path: 'community',
        loadComponent: () =>
          import('./pages/community/community').then((m) => m.CommunityComponent),
        canActivate: [authGuard],
      },
      {
        path: 'my',
        loadComponent: () => import('./pages/my-page/my-page').then((m) => m.MyPageComponent),
        canActivate: [authGuard],
      },
    ],
  },
];
