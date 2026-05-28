import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, Chart, LineController } from 'chart.js';
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
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

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, BaseChartDirective],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  showReplanModal = false;
  replanState: 'loading' | 'done' | null = null;

  currentWeek = {
    weekNumber: 1,
    theme: 'JavaScript 핵심 개념 다지기',
    description:
      'React를 배우기 전 필수적인 모던 자바스크립트(ES6+) 문법과 동작 원리를 이해합니다.',
  };

  tasks = signal<Task[]>([
    { id: 't1', title: 'ES6+ 문법 (Arrow functions, Destructuring, Spread)', completed: true },
    { id: 't2', title: '비동기 처리 (Promise, async/await)', completed: true },
    { id: 't3', title: '실행 컨텍스트와 클로저 이해하기', completed: false },
  ]);

  completedCount = computed(() => this.tasks().filter((t) => t.completed).length);
  progressPct = computed(() => Math.round((this.completedCount() / this.tasks().length) * 100));
  strokeDasharray = computed(() => `${this.progressPct()}, 100`);

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

  constructor(
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.cdr.detectChanges();
  }

  toggleTask(id: string) {
    this.tasks.update((tasks) =>
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  handleReplan() {
    this.showReplanModal = true;
    this.replanState = 'loading';
    setTimeout(() => {
      this.replanState = 'done';
      this.cdr.detectChanges();
    }, 2000);
  }

  closeReplan() {
    this.showReplanModal = false;
    setTimeout(() => {
      this.replanState = null;
      this.cdr.detectChanges();
    }, 200);
  }
}
