import { Component, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { RoadmapService, Roadmap } from '../../services/roadmap';
import { ToastService } from '../../components/toast/toast.service';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './roadmap.html',
})
export class RoadmapComponent implements OnInit {
  private roadmapService = inject(RoadmapService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  roadmaps: Roadmap[] = [];
  activeRoadmapId = signal('');
  isLoading = true;

  get activeRoadmap(): Roadmap | undefined {
    return this.roadmaps.find((r) => r.id === this.activeRoadmapId());
  }

  get isPublic(): boolean {
    return this.activeRoadmap?.isPublic ?? false;
  }

  get totalHours(): number {
    return this.activeRoadmap?.weeks.reduce((a, w) => a + w.estimatedHours, 0) ?? 0;
  }

  roadmapTotalHours(r: Roadmap) {
    return r.weeks.reduce((a, w) => a + w.estimatedHours, 0);
  }

  ngOnInit() {
    this.roadmapService.getAll().subscribe({
      next: (roadmaps) => {
        this.roadmaps = roadmaps;
        if (roadmaps.length > 0) {
          const latestId = localStorage.getItem('latest_roadmap_id');
          const target = latestId ? roadmaps.find((r) => r.id === latestId) : null;
          this.activeRoadmapId.set(target?.id ?? roadmaps[0].id);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectRoadmap(id: string) {
    this.activeRoadmapId.set(id);
  }

  togglePublic() {
    if (!this.activeRoadmap) return;
    const newVal = !this.activeRoadmap.isPublic;

    this.roadmaps = this.roadmaps.map((r) =>
      r.id === this.activeRoadmap!.id ? { ...r, isPublic: newVal } : r,
    );
    this.cdr.detectChanges();

    this.roadmapService.togglePublic(this.activeRoadmap.id, newVal).subscribe({
      next: (updated) => {
        this.roadmaps = this.roadmaps.map((r) => (r.id === updated.id ? updated : r));
        this.toast.show(
          newVal ? '로드맵이 공개로 설정되었습니다' : '로드맵이 비공개로 설정되었습니다',
          'info',
        );
        this.cdr.detectChanges();
      },
      error: () => {
        this.roadmaps = this.roadmaps.map((r) =>
          r.id === this.activeRoadmap!.id ? { ...r, isPublic: !newVal } : r,
        );
        this.toast.show('설정 변경에 실패했습니다', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  resourceIcon(type: string) {
    return type === 'video' ? 'youtube' : 'file-text';
  }
  resourceColor(type: string) {
    return type === 'video' ? '#ef4444' : '#3b82f6';
  }
}
