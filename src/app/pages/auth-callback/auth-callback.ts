import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center">
      <div class="text-center">
        <div
          class="w-16 h-16 bg-indigo-900 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
        >
          <span class="text-white text-3xl">🧭</span>
        </div>
        <p class="text-slate-600 font-medium">로그인 처리 중...</p>
      </div>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.authService.handleOAuthCallback(token);
      }
    });
  }
}
