import { Injectable } from '@angular/core';
import { ApiService } from './api';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'doc';
}

export interface Week {
  id: string;
  weekNumber: number;
  theme: string;
  description: string;
  estimatedHours: number;
  tasks: Task[];
  resources: Resource[];
}

export interface Roadmap {
  id: string;
  title: string;
  goal: string;
  isPublic: boolean;
  weeks: Week[];
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingData {
  level: string;
  goal: string;
  hours: number;
  selectedInterests: string[];
}

@Injectable({ providedIn: 'root' })
export class RoadmapService {
  constructor(private api: ApiService) {}

  // 내 로드맵 목록
  getAll() {
    return this.api.get<Roadmap[]>('/roadmaps');
  }

  // 로드맵 상세
  getOne(id: string) {
    return this.api.get<Roadmap>(`/roadmaps/${id}`);
  }

  // 공개/비공개 토글
  togglePublic(id: string, isPublic: boolean) {
    return this.api.patch<Roadmap>(`/roadmaps/${id}`, { isPublic });
  }

  // 로드맵 삭제
  remove(id: string) {
    return this.api.delete(`/roadmaps/${id}`);
  }

  // 태스크 완료 토글
  toggleTask(taskId: string) {
    return this.api.patch<Task>(`/roadmaps/tasks/${taskId}/toggle`, {});
  }

  // Claude AI로 로드맵 생성 (온보딩 데이터 전송)
  generateWithAI(data: OnboardingData) {
    return this.api.post<Roadmap>('/ai/generate-roadmap', {
      level: data.level,
      goal: data.goal,
      hours: data.hours,
      selectedInterests: data.selectedInterests,
    });
  }

  // AI 일정 재조정
  replan(data: {
    roadmapId: string;
    currentWeek: number;
    completedTasks: string[];
    remainingWeeks: number;
  }) {
    return this.api.post<Roadmap>('/ai/replan', data);
  }
}
