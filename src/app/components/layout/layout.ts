import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { ToastComponent } from '../toast/toast';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, ToastComponent],
  templateUrl: './layout.html',
})
export class LayoutComponent {
  private cdr = inject(ChangeDetectorRef);
  authService = inject(AuthService);

  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { path: '/roadmap', label: 'Roadmap', icon: 'map' },
    { path: '/notes', label: 'Notes', icon: 'book-open' },
    { path: '/community', label: 'Community', icon: 'users' },
    { path: '/my', label: 'My Page', icon: 'user' },
  ];

  hideNavPaths = ['/login', '/onboarding', '/generating'];

  constructor(public router: Router) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      setTimeout(() => this.cdr.detectChanges(), 0);
    });
  }

  get shouldHideNav(): boolean {
    return this.hideNavPaths.some((p) => this.router.url.startsWith(p));
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  logout() {
    this.authService.logout();
  }
}
