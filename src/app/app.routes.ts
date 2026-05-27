import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { GeneratingComponent } from './pages/generating/generating';
import { OnboardingComponent } from './pages/onboarding/onboarding';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'generating', component: GeneratingComponent },
];
