import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiService } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  bio?: string;
  provider: 'google' | 'github' | 'local';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  isLoggedIn = signal(false);

  constructor(
    private api: ApiService,
    private router: Router,
  ) {
    this.initFromToken();
  }

  private initFromToken() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    this.api.get<User>('/auth/me').subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      },
      error: () => this.logout(),
    });
  }

  handleOAuthCallback(token: string) {
    localStorage.setItem('access_token', token);
    this.api.get<User>('/auth/me').subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.logout();
        this.router.navigate(['/login']);
      },
    });
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:3000/api/auth/google';
  }

  loginWithGithub() {
    window.location.href = 'http://localhost:3000/api/auth/github';
  }

  getMe() {
    return this.api.get<User>('/auth/me').pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      }),
    );
  }

  updateProfile(data: { name?: string; bio?: string }) {
    return this.api
      .patch<User>('/auth/profile', data)
      .pipe(tap((user) => this.currentUser.set({ ...this.currentUser()!, ...user })));
  }

  refreshMe() {
    return this.getMe();
  }

  logout() {
    localStorage.removeItem('access_token');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}
