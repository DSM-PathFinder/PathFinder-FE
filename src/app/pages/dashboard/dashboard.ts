import { Component, OnInit, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
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
import { RoadmapService, Roadmap, Task } from '../../services/roadmap';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../components/toast/toast.service';

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
  imports: [RouterLink, LucideAngularModule, BaseChartDirective],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private roadmapService = inject(RoadmapService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  roadmap: Roadmap | null = null;
  tasks: Task[] = [];
  isLoading = true;
  showReplanModal = false;
  replanState: 'loading' | 'done' | null = null;

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

  chartData: ChartData<'line'> = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: '실제 학습 시간',
        data: [14, 18, 22, 8],
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
        data: [15, 20, 18, 15],
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
    this.loadRoadmap();
  }

  loadRoadmap() {
    this.isLoading = true;
    this.roadmapService.getAll().subscribe({
      next: (roadmaps) => {
        if (roadmaps.length > 0) {
          const latestId = localStorage.getItem('latest_roadmap_id');
          this.roadmap = latestId
            ? (roadmaps.find((r) => r.id === latestId) ?? roadmaps[0])
            : roadmaps[0];
          this.tasks = [...(this.roadmap.weeks[0]?.tasks ?? [])];
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

  toggleTask(taskId: string) {
    this.roadmapService.toggleTask(taskId).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: updated.completed } : t,
        );
        this.cdr.detectChanges();
      },
      error: () => this.toast.show('태스크 업데이트에 실패했습니다', 'error'),
    });
  }

  handleReplan() {
    if (!this.roadmap) return;
    this.showReplanModal = true;
    this.replanState = 'loading';

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
          this.roadmap = updated;
          this.tasks = [...(updated.weeks[0]?.tasks ?? [])];
          this.replanState = 'done';
          this.cdr.detectChanges();
        },
        error: () => {
          this.toast.show('일정 재설정에 실패했습니다', 'error');
          this.closeReplan();
        },
      });
  }

  closeReplan() {
    this.showReplanModal = false;
    setTimeout(() => {
      this.replanState = null;
      this.cdr.detectChanges();
    }, 200);
  }
}
