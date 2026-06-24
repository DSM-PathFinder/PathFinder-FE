import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, Chart } from 'chart.js';
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { RoadmapService, Roadmap, Task, Week } from '../../services/roadmap';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../components/toast/toast.service';
import { DecimalPipe } from '@angular/common';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, BaseChartDirective, DecimalPipe],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private roadmapSvc = inject(RoadmapService);
  private authSvc = inject(AuthService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  roadmaps: Roadmap[] = [];
  activeRoadmap: Roadmap | null = null;
  tasks: Task[] = [];
  isLoading = true;

  showReplanModal = false;
  replanState: 'idle' | 'loading' | 'done' = 'idle';
  private replanInterval: ReturnType<typeof setInterval> | null = null;
  replanProgress = 0;

  get currentUser() {
    return this.authSvc.currentUser();
  }
  get currentWeek() {
    return this.activeRoadmap?.weeks[0] ?? null;
  }
  get completedCount() {
    return this.tasks.filter((t) => t.completed).length;
  }
  get totalTasks() {
    return this.tasks.length;
  }
  get progressPct() {
    return this.totalTasks ? Math.round((this.completedCount / this.totalTasks) * 100) : 0;
  }
  get strokeDasharray() {
    return `${this.progressPct}, 100`;
  }
  get showReplanBanner() {
    return this.activeRoadmap && this.totalTasks > 0 && this.progressPct < 50;
  }

  get allTasksCount() {
    return this.activeRoadmap?.weeks.reduce((a, w) => a + w.tasks.length, 0) ?? 0;
  }
  get allCompletedCount() {
    return (
      this.activeRoadmap?.weeks.reduce(
        (a, w) => a + w.tasks.filter((t) => t.completed).length,
        0,
      ) ?? 0
    );
  }
  get overallProgress() {
    return this.allTasksCount ? Math.round((this.allCompletedCount / this.allTasksCount) * 100) : 0;
  }
  get studiedHours() {
    if (!this.activeRoadmap) return 0;
    return this.activeRoadmap.weeks.reduce((acc, w) => {
      const total = w.tasks.length;
      const done = w.tasks.filter((t) => t.completed).length;
      return acc + (total > 0 ? Math.round((done / total) * w.estimatedHours) : 0);
    }, 0);
  }
  get completedWeeks() {
    return (
      this.activeRoadmap?.weeks.filter(
        (w) => w.tasks.length > 0 && w.tasks.every((t) => t.completed),
      ).length ?? 0
    );
  }
  get totalWeeks() {
    return this.activeRoadmap?.weeks.length ?? 0;
  }

  chartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: '실제 학습 시간',
        data: [],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79,70,229,0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4,
      },
      {
        label: '목표 시간',
        data: [],
        borderColor: '#cbd5e1',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#cbd5e1',
        pointRadius: 3,
      },
    ],
  };

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#0f172a',
        bodyColor: '#64748b',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#64748b', font: { size: 12 } },
      },
      y: {
        grid: { color: '#e2e8f0' },
        border: { display: false },
        ticks: { color: '#64748b', font: { size: 12 } },
      },
    },
  };

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isLoading = true;
    this.roadmapSvc.getAll().subscribe({
      next: (roadmaps) => {
        this.roadmaps = roadmaps;
        if (roadmaps.length > 0) {
          const latestId = localStorage.getItem('latest_roadmap_id');
          const target = latestId ? roadmaps.find((r) => r.id === latestId) : null;
          this.selectRoadmap(target ?? roadmaps[0]);
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

  selectRoadmap(roadmap: Roadmap) {
    this.activeRoadmap = roadmap;
    this.tasks = [...(roadmap.weeks[0]?.tasks ?? [])];
    this.rebuildChart(roadmap.weeks);
    this.cdr.detectChanges();
  }

  rebuildChart(weeks: Week[]) {
    const labels = weeks.map((w) => `W${w.weekNumber}`);
    const actual = weeks.map((w) => {
      const total = w.tasks.length;
      const done = w.tasks.filter((t) => t.completed).length;
      return total > 0 ? Math.round((done / total) * w.estimatedHours) : 0;
    });
    const expected = weeks.map((w) => w.estimatedHours);

    this.chartData = {
      ...this.chartData,
      labels,
      datasets: [
        { ...this.chartData.datasets[0], data: actual },
        { ...this.chartData.datasets[1], data: expected },
      ],
    };
  }

  toggleTask(taskId: string) {
    this.tasks = this.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    if (this.activeRoadmap) {
      const updatedWeeks = this.activeRoadmap.weeks.map((w, i) =>
        i === 0 ? { ...w, tasks: this.tasks } : w,
      );
      this.activeRoadmap = { ...this.activeRoadmap, weeks: updatedWeeks };
      this.rebuildChart(updatedWeeks);
    }
    this.cdr.detectChanges();

    this.roadmapSvc.toggleTask(taskId).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: updated.completed } : t,
        );
        if (this.activeRoadmap) {
          const w2 = this.activeRoadmap.weeks.map((w, i) =>
            i === 0 ? { ...w, tasks: this.tasks } : w,
          );
          this.activeRoadmap = { ...this.activeRoadmap, weeks: w2 };
          this.rebuildChart(w2);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.tasks = this.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t,
        );
        if (this.activeRoadmap) {
          const w2 = this.activeRoadmap.weeks.map((w, i) =>
            i === 0 ? { ...w, tasks: this.tasks } : w,
          );
          this.activeRoadmap = { ...this.activeRoadmap, weeks: w2 };
          this.rebuildChart(w2);
        }
        this.toast.show('태스크 업데이트에 실패했습니다', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  handleReplan() {
    if (!this.activeRoadmap) return;
    this.showReplanModal = true;
    this.replanState = 'loading';
    this.replanProgress = 0;

    this.replanInterval = setInterval(() => {
      if (this.replanProgress < 85) {
        this.replanProgress = Math.min(this.replanProgress + Math.random() * 3, 85);
        this.cdr.detectChanges();
      }
    }, 400);

    const completedIds = this.tasks.filter((t) => t.completed).map((t) => t.id);
    const curWeek = this.activeRoadmap.weeks[0]?.weekNumber ?? 1;
    const remaining = this.activeRoadmap.weeks.length - curWeek + 1;

    this.roadmapSvc
      .replan({
        roadmapId: this.activeRoadmap.id,
        currentWeek: curWeek,
        completedTasks: completedIds,
        remainingWeeks: remaining,
      })
      .subscribe({
        next: (updated) => {
          if (this.replanInterval) clearInterval(this.replanInterval);
          this.replanProgress = 100;
          this.roadmaps = this.roadmaps.map((r) => (r.id === updated.id ? updated : r));
          this.selectRoadmap(updated);
          setTimeout(() => {
            this.replanState = 'done';
            this.cdr.detectChanges();
          }, 400);
          this.cdr.detectChanges();
        },
        error: () => {
          if (this.replanInterval) clearInterval(this.replanInterval);
          this.toast.show('일정 재설정에 실패했습니다', 'error');
          this.closeReplan();
        },
      });
  }

  closeReplan() {
    this.showReplanModal = false;
    this.replanState = 'idle';
    this.replanProgress = 0;
    if (this.replanInterval) clearInterval(this.replanInterval);
  }
}
