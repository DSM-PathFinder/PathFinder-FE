import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Week } from './roadmap';

export interface CommunityRoadmap {
  id: string;
  title: string;
  goal: string;
  category: string;
  isPublic: boolean;
  weeks: Week[];
  user: { id: string; name: string; plan: string };
  _count: { likes: number };
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CommunityService {
  constructor(private api: ApiService) {}

  getPublic(category?: string) {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return this.api.get<CommunityRoadmap[]>(`/community${query}`);
  }

  toggleLike(roadmapId: string) {
    return this.api.post<{ liked: boolean }>(`/community/${roadmapId}/like`, {});
  }
}
