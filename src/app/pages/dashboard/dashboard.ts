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
import { RoadmapService, Roadmap, Task, UserStats, ChartPoint } from '../../services/roadmap';
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
  private roadmapService = inject(RoadmapService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  roadmap: Roadmap | null = null;
  tasks: Task[] = [];
  stats: UserStats | null = null;
  isLoading = true;

  showReplanModal = false;
  replanState: 'idle' | 'loading' | 'done' = 'idle';
  replanProgress = 0;
  private replanInterval: ReturnType<typeof setInterval> | null = null;

  get currentUser() {
    return this.authService.currentUser();
  }
  get currentWeek() {
    return this.roadmap?.weeks[0] ?? null;
  }
  get completedCount() {
    return this.tasks.filter((t) => t.completed).length;
  }
  get progressPct() {
    return this.tasks.length ? Math.round((this.completedCount / this.tasks.length) * 100) : 0;
  }
  get strokeDasharray() {
    return `${this.progressPct}, 100`;
  }

  get showReplanBanner() {
    return this.roadmap && this.tasks.length > 0 && this.progressPct < 50;
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

    this.roadmapService.getAll().subscribe({
      next: (roadmaps) => {
        if (roadmaps.length > 0) {
          const latestId = localStorage.getItem('latest_roadmap_id');
          this.roadmap = latestId
            ? (roadmaps.find((r) => r.id === latestId) ?? roadmaps[0])
            : roadmaps[0];
          this.tasks = [...(this.roadmap.weeks[0]?.tasks ?? [])];

          this.loadChart(this.roadmap.id);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });

    this.roadmapService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.cdr.detectChanges();
      },
    });
  }

  loadChart(roadmapId: string) {
    this.roadmapService.getChart(roadmapId).subscribe({
      next: (points: ChartPoint[]) => {
        this.chartData = {
          ...this.chartData,
          labels: points.map((p) => p.name),
          datasets: [
            { ...this.chartData.datasets[0], data: points.map((p) => p.hours) },
            { ...this.chartData.datasets[1], data: points.map((p) => p.expected) },
          ],
        };
        this.cdr.detectChanges();
      },
    });
  }

  toggleTask(taskId: string) {
    this.roadmapService.toggleTask(taskId).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: updated.completed } : t,
        );
        this.roadmapService.getStats().subscribe({
          next: (s) => {
            this.stats = s;
            this.cdr.detectChanges();
          },
        });
        this.cdr.detectChanges();
      },
      error: () => this.toast.show('태스크 업데이트에 실패했습니다', 'error'),
    });
  }

  handleReplan() {
    if (!this.roadmap) return;
    this.showReplanModal = true;
    this.replanState = 'loading';
    this.replanProgress = 0;

    this.replanInterval = setInterval(() => {
      if (this.replanProgress < 85) {
        this.replanProgress += Math.random() * 3;
        if (this.replanProgress > 85) this.replanProgress = 85;
        this.cdr.detectChanges();
      }
    }, 400);

    const completedTaskIds = this.tasks.filter((t) => t.completed).map((t) => t.id);
    const currentWeekNum = this.roadmap.weeks[0]?.weekNumber ?? 1;
    const remainingWeeks = this.roadmap.weeks.length - currentWeekNum + 1;

    this.roadmapService
      .replan({
        roadmapId: this.roadmap.id,
        currentWeek: currentWeekNum,
        completedTasks: completedTaskIds,
        remainingWeeks,
      })
      .subscribe({
        next: (updated) => {
          if (this.replanInterval) clearInterval(this.replanInterval);
          this.replanProgress = 100;
          this.roadmap = updated;
          this.tasks = [...(updated.weeks[0]?.tasks ?? [])];
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
