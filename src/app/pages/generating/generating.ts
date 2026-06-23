import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { RoadmapService } from '../../services/roadmap';
import { ToastService } from '../../components/toast/toast.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-generating',
  standalone: true,
  imports: [LucideAngularModule, DecimalPipe],
  templateUrl: './generating.html',
})
export class GeneratingComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private roadmapService = inject(RoadmapService);
  private toast = inject(ToastService);

  steps = [
    { icon: 'target', text: '목표 달성을 위한 핵심 기술 스택 분석 중...' },
    { icon: 'book-open', text: '수준에 맞는 최적의 강의 및 문서 선별 중...' },
    { icon: 'sparkles', text: '주차별 세부 학습 계획 생성 중...' },
  ];

  visibleSteps: boolean[] = [false, false, false];
  progress = 0;

  private timers: ReturnType<typeof setTimeout>[] = [];
  private progressInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.steps.forEach((_, i) => {
      const t = setTimeout(
        () => {
          this.visibleSteps[i] = true;
        },
        800 + i * 1200,
      );
      this.timers.push(t);
    });

    this.progressInterval = setInterval(() => {
      if (this.progress < 85) {
        this.progress += Math.random() * 2.5;
        if (this.progress > 85) this.progress = 85;
      }
    }, 400);

    const raw = sessionStorage.getItem('onboarding_data');
    if (!raw) {
      this.router.navigate(['/onboarding']);
      return;
    }

    const formData = JSON.parse(raw);

    this.roadmapService.generateWithAI(formData).subscribe({
      next: (roadmap) => {
        this.progress = 100;
        sessionStorage.removeItem('onboarding_data');
        localStorage.setItem('latest_roadmap_id', roadmap.id);
        const t = setTimeout(() => this.router.navigate(['/roadmap']), 600);
        this.timers.push(t);
      },
      error: () => {
        this.toast.show('로드맵 생성에 실패했습니다. 다시 시도해주세요.', 'error');
        this.router.navigate(['/onboarding']);
      },
    });
  }

  ngOnDestroy() {
    this.timers.forEach((t) => clearTimeout(t));
    if (this.progressInterval) clearInterval(this.progressInterval);
  }
}
