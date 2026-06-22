import { Injectable } from '@angular/core';
import { ApiService } from './api';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string | null;
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
  actualHours?: number;
  tasks: Task[];
  resources: Resource[];
}

export interface Roadmap {
  id: string;
  title: string;
  goal: string;
  category: string;
  isPublic: boolean;
  weeks: Week[];
  _count?: { likes: number };
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingData {
  level: string;
  goal: string;
  hours: number;
  selectedInterests: string[];
}

export interface UserStats {
  studiedHours: number;
  overallProgress: number;
  completedWeeks: number;
  totalWeeks: number;
  totalLikes: number;
  streak: number;
}

export interface ChartPoint {
  name: string;
  hours: number;
  expected: number;
}

@Injectable({ providedIn: 'root' })
export class RoadmapService {
  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get<Roadmap[]>('/roadmaps');
  }

  getOne(id: string) {
    return this.api.get<Roadmap>(`/roadmaps/${id}`);
  }

  getStats() {
    return this.api.get<UserStats>('/roadmaps/stats');
  }

  getChart(roadmapId: string) {
    return this.api.get<ChartPoint[]>(`/roadmaps/${roadmapId}/chart`);
  }

  togglePublic(id: string, isPublic: boolean) {
    return this.api.patch<Roadmap>(`/roadmaps/${id}`, { isPublic });
  }

  remove(id: string) {
    return this.api.delete(`/roadmaps/${id}`);
  }

  toggleTask(taskId: string) {
    return this.api.patch<Task>(`/roadmaps/tasks/${taskId}/toggle`, {});
  }

  generateWithAI(data: OnboardingData) {
    return this.api.post<Roadmap>('/ai/generate-roadmap', {
      level: data.level,
      goal: data.goal,
      hours: data.hours,
      selectedInterests: data.selectedInterests,
    });
  }

  replan(data: {
    roadmapId: string;
    currentWeek: number;
    completedTasks: string[];
    remainingWeeks: number;
  }) {
    return this.api.post<Roadmap>('/ai/replan', data);
  }
}
