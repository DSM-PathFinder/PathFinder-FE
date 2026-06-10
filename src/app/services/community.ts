import { Injectable } from '@angular/core';
import { ApiService } from './api';
import { Roadmap } from './roadmap';

export interface CommunityRoadmap extends Roadmap {
  user: { id: string; name: string; plan: string };
  _count: { likes: number };
}

@Injectable({ providedIn: 'root' })
export class CommunityService {
  constructor(private api: ApiService) {}

  getPublic() {
    return this.api.get<CommunityRoadmap[]>('/community');
  }

  toggleLike(roadmapId: string) {
    return this.api.post<{ liked: boolean }>(`/community/${roadmapId}/like`, {});
  }
}
