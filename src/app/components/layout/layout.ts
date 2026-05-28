import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ToastComponent } from '../toast/toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, ToastComponent],
  templateUrl: './layout.html',
})
export class LayoutComponent {
  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { path: '/roadmap', label: 'Roadmap', icon: 'map' },
    { path: '/notes', label: 'Notes', icon: 'book-open' },
    { path: '/community', label: 'Community', icon: 'users' },
    { path: '/my', label: 'My Page', icon: 'user' },
  ];

  hideNavPaths = ['/login', '/onboarding', '/generating'];

  constructor(public router: Router) {}

  get shouldHideNav(): boolean {
    return this.hideNavPaths.some((p) => this.router.url.startsWith(p));
  }
}
