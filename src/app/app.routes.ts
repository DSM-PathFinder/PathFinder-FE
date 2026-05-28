import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { GeneratingComponent } from './pages/generating/generating';
import { OnboardingComponent } from './pages/onboarding/onboarding';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LayoutComponent } from './components/layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'generating', component: GeneratingComponent },
  { path: 'dashboard', component: DashboardComponent },
];
