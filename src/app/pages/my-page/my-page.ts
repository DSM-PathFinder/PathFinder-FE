import { Component, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ModalComponent } from '../../components/modal/modal';
import { AuthService } from '../../services/auth';
import { RoadmapService, Roadmap, UserStats } from '../../services/roadmap';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-my-page',
  standalone: true,
  imports: [RouterLink, FormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './my-page.html',
})
export class MyPageComponent implements OnInit {
  private authService = inject(AuthService);
  private roadmapService = inject(RoadmapService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  editOpen = signal(false);
  logoutOpen = signal(false);

  myRoadmaps: Roadmap[] = [];
  stats: UserStats | null = null;
  isLoading = true;

  editName = '';
  editBio = '';

  get currentUser() {
    return this.authService.currentUser();
  }

  get joinDate(): string {
    const user = this.currentUser as any;
    if (!user?.createdAt) return '';
    return new Date(user.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
  }

  get providerIcon(): string {
    const p = this.currentUser?.provider;
    if (p === 'google') return 'globe';
    if (p === 'github') return 'github';
    return 'user';
  }

  get providerLabel(): string {
    const p = this.currentUser?.provider;
    if (p === 'google') return 'Google';
    if (p === 'github') return 'GitHub';
    return 'Local';
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isLoading = true;
    this.roadmapService.getAll().subscribe({
      next: (roadmaps) => {
        this.myRoadmaps = roadmaps;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });

    this.roadmapService.getStats().subscribe({
      next: (s) => {
        this.stats = s;
        this.cdr.detectChanges();
      },
    });
  }

  openEdit() {
    this.editName = this.currentUser?.name ?? '';
    this.editBio = this.currentUser?.bio ?? '';
    this.editOpen.set(true);
  }

  saveProfile() {
    this.authService.updateProfile({ name: this.editName, bio: this.editBio }).subscribe({
      next: () => {
        this.editOpen.set(false);
        this.toast.show('프로필이 업데이트되었습니다', 'success');
        this.cdr.detectChanges();
      },
      error: () => this.toast.show('프로필 업데이트에 실패했습니다', 'error'),
    });
  }

  logout() {
    this.logoutOpen.set(false);
    this.authService.logout();
  }
}
