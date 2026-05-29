import { Component, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../components/toast/toast.service';

interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'doc';
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface WeekPlan {
  id: string;
  weekNumber: number;
  theme: string;
  description: string;
  tasks: Task[];
  resources: Resource[];
  estimatedHours: number;
}

interface Roadmap {
  id: string;
  title: string;
  goal: string;
  weeks: WeekPlan[];
}

const ROADMAPS: Roadmap[] = [
  {
    id: 'rm_1',
    title: 'Frontend Developer Path',
    goal: '풀스택 개발자 취업 (React & Node.js)',
    weeks: [
      {
        id: 'w_1',
        weekNumber: 1,
        theme: 'JavaScript 핵심 개념 다지기',
        description:
          'React를 배우기 전 필수적인 모던 자바스크립트(ES6+) 문법과 동작 원리를 이해합니다.',
        estimatedHours: 15,
        tasks: [
          {
            id: 't_1_1',
            title: 'ES6+ 문법 (Arrow functions, Destructuring, Spread)',
            completed: true,
          },
          { id: 't_1_2', title: '비동기 처리 (Promise, async/await)', completed: true },
          { id: 't_1_3', title: '실행 컨텍스트와 클로저 이해하기', completed: false },
        ],
        resources: [
          { id: 'r_1_1', title: 'MDN — JavaScript Guide', url: '#', type: 'doc' },
          { id: 'r_1_2', title: 'Traversy Media — JS Crash Course', url: '#', type: 'video' },
          { id: 'r_1_3', title: '모던 자바스크립트 Deep Dive 요약', url: '#', type: 'article' },
        ],
      },
      {
        id: 'w_2',
        weekNumber: 2,
        theme: 'React 기초와 컴포넌트',
        description:
          'React의 핵심 개념인 JSX, 컴포넌트, Props, State를 학습하고 간단한 UI를 만들어봅니다.',
        estimatedHours: 20,
        tasks: [
          { id: 't_2_1', title: 'CRA 또는 Vite로 React 프로젝트 세팅', completed: false },
          { id: 't_2_2', title: 'useState와 useEffect 훅 마스터하기', completed: false },
          { id: 't_2_3', title: '간단한 Todo List 앱 만들기', completed: false },
        ],
        resources: [
          { id: 'r_2_1', title: 'React 공식 문서 — 틱택토 튜토리얼', url: '#', type: 'doc' },
          { id: 'r_2_2', title: 'Web Dev Simplified — React Hooks', url: '#', type: 'video' },
        ],
      },
      {
        id: 'w_3',
        weekNumber: 3,
        theme: '상태 관리와 라우팅',
        description: '복잡한 애플리케이션을 위한 전역 상태 관리와 페이지 이동(라우팅)을 배웁니다.',
        estimatedHours: 18,
        tasks: [
          { id: 't_3_1', title: 'React Router DOM 적용하기', completed: false },
          { id: 't_3_2', title: 'Context API로 전역 상태 관리', completed: false },
          { id: 't_3_3', title: 'Zustand 또는 Redux Toolkit 기초', completed: false },
        ],
        resources: [
          { id: 'r_3_1', title: 'React Router v6 Tutorial', url: '#', type: 'doc' },
          { id: 'r_3_2', title: 'Zustand Crash Course', url: '#', type: 'video' },
        ],
      },
      {
        id: 'w_4',
        weekNumber: 4,
        theme: '백엔드 연동 및 API 통신',
        description: 'REST API를 호출하고 데이터를 화면에 렌더링하는 방법을 학습합니다.',
        estimatedHours: 15,
        tasks: [
          { id: 't_4_1', title: 'Fetch API와 Axios 비교 및 사용', completed: false },
          { id: 't_4_2', title: 'React Query(TanStack Query)로 데이터 페칭', completed: false },
          { id: 't_4_3', title: '에러 핸들링 및 로딩 상태 처리', completed: false },
        ],
        resources: [
          { id: 'r_4_1', title: 'TanStack Query Docs', url: '#', type: 'doc' },
          { id: 'r_4_2', title: 'Axios vs Fetch', url: '#', type: 'article' },
        ],
      },
    ],
  },
  {
    id: 'rm_2',
    title: 'TypeScript 마스터 클래스',
    goal: '타입스크립트 깊이 이해하기',
    weeks: [
      {
        id: 'ts_w_1',
        weekNumber: 1,
        theme: 'TypeScript 기초 문법',
        description:
          'JavaScript에 타입을 더하는 TypeScript의 기본 문법과 타입 시스템을 학습합니다.',
        estimatedHours: 10,
        tasks: [
          {
            id: 'ts_t_1_1',
            title: '기본 타입 (string, number, boolean, array, tuple)',
            completed: false,
          },
          { id: 'ts_t_1_2', title: 'Interface와 Type Alias의 차이', completed: false },
          { id: 'ts_t_1_3', title: 'Union, Intersection 타입', completed: false },
        ],
        resources: [
          { id: 'ts_r_1_1', title: 'TypeScript 공식 핸드북', url: '#', type: 'doc' },
          { id: 'ts_r_1_2', title: 'Net Ninja — TypeScript Tutorial', url: '#', type: 'video' },
        ],
      },
      {
        id: 'ts_w_2',
        weekNumber: 2,
        theme: 'Generics와 고급 타입',
        description: '재사용 가능한 타입을 만드는 제네릭과 유틸리티 타입을 학습합니다.',
        estimatedHours: 12,
        tasks: [
          { id: 'ts_t_2_1', title: 'Generic 함수와 클래스', completed: false },
          { id: 'ts_t_2_2', title: 'Utility Types (Partial, Pick, Omit)', completed: false },
          { id: 'ts_t_2_3', title: 'Conditional Types와 infer 키워드', completed: false },
        ],
        resources: [
          { id: 'ts_r_2_1', title: '타입스크립트 챌린지 (type-challenges)', url: '#', type: 'doc' },
          { id: 'ts_r_2_2', title: 'Matt Pocock — TypeScript Tips', url: '#', type: 'video' },
        ],
      },
    ],
  },
  {
    id: 'rm_3',
    title: 'AI 엔지니어 전환 코스',
    goal: 'LLM 서비스 구축 능력 보유',
    weeks: [
      {
        id: 'ai_w_1',
        weekNumber: 1,
        theme: 'Python 기초와 데이터 처리',
        description: 'AI 개발의 기본이 되는 Python 문법과 NumPy, Pandas를 학습합니다.',
        estimatedHours: 12,
        tasks: [
          { id: 'ai_t_1_1', title: 'Python 핵심 문법 복습', completed: false },
          { id: 'ai_t_1_2', title: 'NumPy 배열 연산', completed: false },
          { id: 'ai_t_1_3', title: 'Pandas로 데이터 분석', completed: false },
        ],
        resources: [
          { id: 'ai_r_1_1', title: 'Python for Data Science', url: '#', type: 'doc' },
          { id: 'ai_r_1_2', title: 'Sentdex — Python Tutorials', url: '#', type: 'video' },
        ],
      },
      {
        id: 'ai_w_2',
        weekNumber: 2,
        theme: 'LLM API 활용 (OpenAI, Anthropic)',
        description: 'GPT-4와 Claude API를 호출하고 프롬프트 엔지니어링을 학습합니다.',
        estimatedHours: 14,
        tasks: [
          { id: 'ai_t_2_1', title: 'OpenAI API 호출 및 스트리밍', completed: false },
          { id: 'ai_t_2_2', title: '프롬프트 엔지니어링 패턴', completed: false },
          { id: 'ai_t_2_3', title: 'Function Calling으로 도구 사용', completed: false },
        ],
        resources: [
          { id: 'ai_r_2_1', title: 'OpenAI Cookbook', url: '#', type: 'doc' },
          { id: 'ai_r_2_2', title: 'Prompt Engineering Guide', url: '#', type: 'article' },
        ],
      },
    ],
  },
];

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  templateUrl: './roadmap.html',
})
export class RoadmapComponent {
  roadmaps = ROADMAPS;
  activeRoadmapId = signal(ROADMAPS[0].id);
  isPublicMap = signal<Record<string, boolean>>(
    Object.fromEntries(ROADMAPS.map((r) => [r.id, true])),
  );

  constructor(private toast: ToastService) {}

  get activeRoadmap() {
    return this.roadmaps.find((r) => r.id === this.activeRoadmapId()) ?? this.roadmaps[0];
  }

  get isPublic() {
    return this.isPublicMap()[this.activeRoadmap.id];
  }

  get totalHours() {
    return this.activeRoadmap.weeks.reduce((a, w) => a + w.estimatedHours, 0);
  }

  roadmapTotalHours(roadmap: Roadmap) {
    return roadmap.weeks.reduce((a, w) => a + w.estimatedHours, 0);
  }

  selectRoadmap(id: string) {
    this.activeRoadmapId.set(id);
  }

  togglePublic() {
    const current = this.isPublicMap();
    this.isPublicMap.set({
      ...current,
      [this.activeRoadmap.id]: !current[this.activeRoadmap.id],
    });
    this.toast.show(
      this.isPublic ? '로드맵이 비공개로 설정되었습니다' : '로드맵이 공개로 설정되었습니다',
      'info',
    );
  }

  resourceIcon(type: string) {
    return type === 'video' ? 'youtube' : 'file-text';
  }

  resourceColor(type: string) {
    return type === 'video' ? '#ef4444' : '#3b82f6';
  }
}
