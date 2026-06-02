import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ModalComponent } from '../../components/modal/modal';
import { ToastService } from '../../components/toast/toast.service';

interface Profile {
  name: string;
  email: string;
  bio: string;
}

interface MyRoadmap {
  id: string;
  title: string;
  goal: string;
  weeks: number;
  isPublic: boolean;
  progress: number;
}

@Component({
  selector: 'app-my-page',
  standalone: true,
  imports: [RouterLink, FormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './my-page.html',
})
export class MyPageComponent {
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  editOpen = signal(false);
  logoutOpen = signal(false);
  notifications = signal(true);
  publicProfile = signal(true);

  profile = signal<Profile>({
    name: 'User Name',
    email: 'user@pathfinder.app',
    bio: '풀스택 개발자를 꿈꾸는 학습자입니다.',
  });

  // 편집용 임시 값
  editName = '';
  editEmail = '';
  editBio = '';

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

  myRoadmaps: MyRoadmap[] = [
    {
      id: 'rm_1',
      title: 'Frontend Developer Path',
      goal: '풀스택 개발자 취업 (React & Node.js)',
      weeks: 4,
      isPublic: true,
      progress: 35,
    },
    {
      id: 'rm_2',
      title: 'TypeScript 마스터',
      goal: '타입스크립트 깊이 이해하기',
      weeks: 8,
      isPublic: false,
      progress: 10,
    },
  ];

  openEdit() {
    const p = this.profile();
    this.editName = p.name;
    this.editEmail = p.email;
    this.editBio = p.bio;
    this.editOpen.set(true);
  }

  saveProfile() {
    this.profile.set({
      name: this.editName,
      email: this.editEmail,
      bio: this.editBio,
    });
    this.editOpen.set(false);
    this.toast.show('프로필이 업데이트되었습니다', 'success');
    this.cdr.detectChanges();
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
}
