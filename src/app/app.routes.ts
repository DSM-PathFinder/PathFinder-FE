import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { GeneratingComponent } from './pages/generating/generating';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  { path: 'generating', component: GeneratingComponent },
];
