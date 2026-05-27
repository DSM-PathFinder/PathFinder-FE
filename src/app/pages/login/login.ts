import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  constructor(private router: Router) {}

  handleLogin() {
    this.router.navigate(['/generating']);
  }
}
