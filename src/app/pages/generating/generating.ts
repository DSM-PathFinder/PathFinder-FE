import { Component, OnInit, OnDestroy } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-generating',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './generating.html',
})
export class GeneratingComponent implements OnInit, OnDestroy {
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
        600 + i * 1200,
      );
      this.timers.push(t);
    });

    let current = 0;
    this.progressInterval = setInterval(() => {
      if (current < 90) {
        current += Math.random() * 3;
        this.progress = Math.min(current, 90);
      }
    }, 300);
  }

  complete() {
    this.progress = 100;
  }

  ngOnDestroy() {
    this.timers.forEach((t) => clearTimeout(t));
    if (this.progressInterval) clearInterval(this.progressInterval);
  }
}
