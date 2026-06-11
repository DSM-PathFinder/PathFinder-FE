import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoadmapService } from '../../services/roadmap';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './onboarding.html',
})
export class OnboardingComponent {
  step = 1;
  isLoading = false;

  formData = {
    level: '',
    goal: '',
    hours: 10,
    selectedInterests: [] as string[],
  };

  levels = [
    { id: 'beginner', label: '입문', desc: '해당 분야를 처음 접해봅니다' },
    { id: 'novice', label: '초급', desc: '기본적인 개념만 알고 있습니다' },
    { id: 'intermediate', label: '중급', desc: '간단한 프로젝트 경험이 있습니다' },
    { id: 'advanced', label: '고급', desc: '실무 경험이 있거나 깊이 있는 이해가 있습니다' },
  ];

  interests = [
    'Frontend',
    'Backend',
    'AI/ML',
    'Mobile (iOS/Android)',
    'DevOps',
    'Data Science',
    'UI/UX Design',
    'Game Dev',
    'Security',
    'Blockchain',
  ];

  stepMeta = [
    {
      icon: 'brain',
      label: 'Step 1 of 4',
      title: '현재 기술 수준이 어떻게 되시나요?',
      desc: '맞춤형 커리큘럼을 구성하기 위해 필요합니다.',
    },
    {
      icon: 'target',
      label: 'Step 2 of 4',
      title: '최종 목표를 알려주세요',
      desc: '구체적일수록 더 정확한 로드맵이 생성됩니다.',
    },
    {
      icon: 'clock',
      label: 'Step 3 of 4',
      title: '주당 학습 가능 시간은?',
      desc: '현실적인 일정을 계획해 드립니다.',
    },
    {
      icon: 'sparkles',
      label: 'Step 4 of 4',
      title: '관심 분야를 선택해주세요',
      desc: '관련된 최신 트렌드와 자료를 추천해 드립니다. (다중 선택 가능)',
    },
  ];

  constructor(
    private router: Router,
    private roadmapService: RoadmapService,
    private toast: ToastService,
  ) {}

  get progressWidth() {
    return `${this.step / 4}*100%`;
  }
  get currentMeta() {
    return this.stepMeta[this.step - 1];
  }

  get isValid(): boolean {
    switch (this.step) {
      case 1:
        return this.formData.level !== '';
      case 2:
        return this.formData.goal.trim().length > 0;
      case 3:
        return this.formData.hours > 0;
      case 4:
        return this.formData.selectedInterests.length > 0;
      default:
        return false;
    }
  }

  next() {
    if (this.step < 4) this.step++;
    else this.generate();
  }

  back() {
    if (this.step > 1) this.step--;
  }

  selectLevel(id: string) {
    this.formData.level = id;
  }

  toggleInterest(interest: string) {
    const idx = this.formData.selectedInterests.indexOf(interest);
    if (idx > -1) this.formData.selectedInterests.splice(idx, 1);
    else this.formData.selectedInterests.push(interest);
    this.formData.selectedInterests = [...this.formData.selectedInterests];
  }

  isInterestSelected(i: string) {
    return this.formData.selectedInterests.includes(i);
  }

  onHoursChange(v: number) {
    this.formData.hours = v;
  }

  private generate() {
    this.isLoading = true;
    this.router.navigate(['/generating']);

    this.roadmapService.generateWithAI(this.formData).subscribe({
      next: (roadmap) => {
        localStorage.setItem('latest_roadmap_id', roadmap.id);
        this.router.navigate(['/roadmap']);
      },
      error: (err) => {
        console.log(err);
        this.toast.show('로드맵 생성에 실패했습니다. 다시 시도해주세요.', 'error');
        this.router.navigate(['/onboarding']);
        this.isLoading = false;
      },
    });
  }

  get sliderPct() {
    return ((this.formData.hours - 1) / (40 - 1)) * 100;
  }

  onSliderChange(e: Event) {
    this.formData.hours = Number((e.target as HTMLInputElement).value);
  }
}
