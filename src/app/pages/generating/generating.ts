import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  private timers: ReturnType<typeof setTimeout>[] = [];

  ngOnInit() {
    this.steps.forEach((_, i) => {
      const t = setTimeout(
        () => {
          this.visibleSteps[i] = true;
        },
        600 + i * 900,
      );
      this.timers.push(t);
    });
  }

  ngOnDestroy() {
    this.timers.forEach((t) => clearTimeout(t));
  }
}
