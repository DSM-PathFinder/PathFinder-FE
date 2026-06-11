import { Component, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ModalComponent } from '../../components/modal/modal';
import { AuthService } from '../../services/auth';
import { RoadmapService, Roadmap } from '../../services/roadmap';
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
  notifications = signal(true);
  publicProfile = signal(true);

  myRoadmaps: Roadmap[] = [];
  isLoading = true;

  editName = '';
  editEmail = '';
  editBio = '';

  get currentUser() {
    return this.authService.currentUser();
  }

  stats = [
    {
      label: '총 학습 시간',
      value: '42h',
      icon: 'book-open',
      color: 'text-indigo-600 bg-indigo-50',
    },
    { label: '현재 스트릭', value: '4일', icon: 'flame', color: 'text-amber-600 bg-amber-50' },
    { label: '완료한 주차', value: '4 / 12', icon: 'map', color: 'text-emerald-600 bg-emerald-50' },
    { label: '받은 좋아요', value: '127', icon: 'heart', color: 'text-rose-600 bg-rose-50' },
  ];

  ngOnInit() {
    this.loadRoadmaps();
  }

  loadRoadmaps() {
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
  }

  openEdit() {
    const user = this.currentUser;
    this.editName = user?.name ?? '';
    this.editEmail = user?.email ?? '';
    this.editBio = user?.bio ?? '';
    this.editOpen.set(true);
  }

  saveProfile() {
    this.authService
      .updateProfile({
        name: this.editName,
        bio: this.editBio,
      })
      .subscribe({
        next: () => {
          this.editOpen.set(false);
          this.toast.show('프로필이 업데이트되었습니다', 'success');
          this.cdr.detectChanges();
        },
        error: () => this.toast.show('프로필 업데이트에 실패했습니다', 'error'),
      });
  }

  toggleNotifications() {
    this.notifications.update((v) => !v);
    this.toast.show(this.notifications() ? '알림이 켜졌습니다' : '알림이 꺼졌습니다', 'info');
  }

  togglePublicProfile() {
    this.publicProfile.update((v) => !v);
    this.toast.show(
      this.publicProfile() ? '프로필이 공개로 변경되었습니다' : '프로필이 비공개로 변경되었습니다',
      'info',
    );
  }

  logout() {
    this.logoutOpen.set(false);
    this.authService.logout();
  }
}
