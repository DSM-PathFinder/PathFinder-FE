import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { RoadmapService } from '../../services/roadmap';
import { ToastService } from '../../components/toast/toast.service';

interface ThinkingMessage {
  text: string;
  type: 'thinking' | 'found' | 'building';
}

@Component({
  selector: 'app-generating',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './generating.html',
})
export class GeneratingComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private roadmapSvc = inject(RoadmapService);
  private toast = inject(ToastService);

  messages: ThinkingMessage[] = [];
  dots = '';
  isDone = false;

  private timers: ReturnType<typeof setTimeout>[] = [];
  private dotInterval: ReturnType<typeof setInterval> | null = null;

  private readonly thinkingFlow: { delay: number; msg: ThinkingMessage }[] = [
    { delay: 300, msg: { text: '학습자 정보 분석 중', type: 'thinking' } },
    { delay: 1200, msg: { text: '현재 수준에 맞는 커리큘럼 탐색 중', type: 'thinking' } },
    { delay: 2400, msg: { text: '최적 학습 경로 발견', type: 'found' } },
    { delay: 3200, msg: { text: '주차별 학습 테마 설계 중', type: 'building' } },
    { delay: 4400, msg: { text: '실습 태스크 구성 중', type: 'building' } },
    { delay: 5600, msg: { text: '추천 학습 자료 선별 중', type: 'thinking' } },
    { delay: 6800, msg: { text: '맞춤형 일정 조정 중', type: 'building' } },
    { delay: 8000, msg: { text: '로드맵 최종 검토 중', type: 'thinking' } },
  ];

  ngOnInit() {
    this.dotInterval = setInterval(() => {
      this.dots = this.dots.length >= 3 ? '' : this.dots + '.';
    }, 500);

    this.thinkingFlow.forEach(({ delay, msg }) => {
      const t = setTimeout(() => {
        this.messages = [...this.messages, msg];
      }, delay);
      this.timers.push(t);
    });

    const raw = sessionStorage.getItem('onboarding_data');
    if (!raw) {
      this.router.navigate(['/onboarding']);
      return;
    }

    let formData: any;
    try {
      formData = JSON.parse(raw);
    } catch {
      this.router.navigate(['/onboarding']);
      return;
    }

    this.roadmapSvc.generateWithAI(formData).subscribe({
      next: (roadmap) => {
        this.isDone = true;
        sessionStorage.removeItem('onboarding_data');
        localStorage.setItem('latest_roadmap_id', roadmap.id);
        const t = setTimeout(() => this.router.navigate(['/roadmap']), 1200);
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
    if (this.dotInterval) clearInterval(this.dotInterval);
  }
}
