import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ModalComponent } from '../../components/modal/modal';
import { ToastService } from '../../components/toast/toast.service';

interface CommunityPost {
  id: string;
  user: { name: string; role: string };
  roadmapTitle: string;
  goal: string;
  weekCount: number;
  likes: number;
  category: string;
}

interface WeekPlan {
  id: string;
  weekNumber: number;
  theme: string;
  description: string;
  estimatedHours: number;
  tasks: { id: string; title: string }[];
  resources: { id: string; title: string; type: string }[];
}

const MOCK_WEEKS: WeekPlan[] = [
  {
    id: 'w_1',
    weekNumber: 1,
    theme: 'JavaScript 핵심 개념 다지기',
    description:
      'React를 배우기 전 필수적인 모던 자바스크립트(ES6+) 문법과 동작 원리를 이해합니다.',
    estimatedHours: 15,
    tasks: [
      { id: 't_1_1', title: 'ES6+ 문법 (Arrow functions, Destructuring, Spread)' },
      { id: 't_1_2', title: '비동기 처리 (Promise, async/await)' },
      { id: 't_1_3', title: '실행 컨텍스트와 클로저 이해하기' },
    ],
    resources: [
      { id: 'r_1_1', title: 'MDN — JavaScript Guide', type: 'doc' },
      { id: 'r_1_2', title: 'Traversy Media — JS Crash Course', type: 'video' },
    ],
  },
  {
    id: 'w_2',
    weekNumber: 2,
    theme: 'React 기초와 컴포넌트',
    description: 'React의 핵심 개념인 JSX, 컴포넌트, Props, State를 학습합니다.',
    estimatedHours: 20,
    tasks: [
      { id: 't_2_1', title: 'CRA 또는 Vite로 React 프로젝트 세팅' },
      { id: 't_2_2', title: 'useState와 useEffect 훅 마스터하기' },
      { id: 't_2_3', title: '간단한 Todo List 앱 만들기' },
    ],
    resources: [
      { id: 'r_2_1', title: 'React 공식 문서 — 틱택토 튜토리얼', type: 'doc' },
      { id: 'r_2_2', title: 'Web Dev Simplified — React Hooks', type: 'video' },
    ],
  },
];

const MOCK_POSTS: CommunityPost[] = [
  {
    id: 'cp_1',
    user: { name: '김개발', role: '취업 준비생' },
    roadmapTitle: '비전공자 프론트엔드 6개월 완성',
    goal: '네카라쿠배 프론트엔드 신입 합격',
    weekCount: 24,
    likes: 342,
    category: 'Frontend',
  },
  {
    id: 'cp_2',
    user: { name: '이데이터', role: '주니어 개발자' },
    roadmapTitle: '데이터 엔지니어로 커리어 전환',
    goal: 'Python & Spark 마스터',
    weekCount: 12,
    likes: 128,
    category: 'Data',
  },
  {
    id: 'cp_3',
    user: { name: '박서버', role: '학생' },
    roadmapTitle: 'NestJS 백엔드 실무 가이드',
    goal: '안정적인 API 서버 구축',
    weekCount: 8,
    likes: 89,
    category: 'Backend',
  },
  {
    id: 'cp_4',
    user: { name: '최디자인', role: 'UI/UX 디자이너' },
    roadmapTitle: '디자이너를 위한 인터랙티브 웹',
    goal: 'Three.js & Framer Motion 마스터',
    weekCount: 10,
    likes: 567,
    category: 'Frontend',
  },
  {
    id: 'cp_5',
    user: { name: '정인공', role: 'AI 연구원' },
    roadmapTitle: 'LLM 서비스 구축 A to Z',
    goal: 'LangChain & Vector DB 활용',
    weekCount: 16,
    likes: 421,
    category: 'AI/ML',
  },
  {
    id: 'cp_6',
    user: { name: '강옵스', role: '시스템 엔지니어' },
    roadmapTitle: 'AWS & Kubernetes 기초',
    goal: '클라우드 인프라 자동화',
    weekCount: 12,
    likes: 215,
    category: 'DevOps',
  },
];

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, ModalComponent],
  templateUrl: './community.html',
})
export class CommunityComponent {
  private toast = inject(ToastService);

  categories = ['All', 'Frontend', 'Backend', 'AI/ML', 'Data', 'DevOps'];
  activeCategory = 'All';
  searchQuery = '';
  activePost: CommunityPost | null = null;
  likedIds = new Set<string>();
  posts = MOCK_POSTS;
  displayWeeks = MOCK_WEEKS;

  get filteredPosts(): CommunityPost[] {
    return this.posts.filter((p) => {
      const catMatch = this.activeCategory === 'All' || p.category === this.activeCategory;
      const q = this.searchQuery.toLowerCase();
      const searchMatch =
        !q || p.roadmapTitle.toLowerCase().includes(q) || p.goal.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }

  openPost(post: CommunityPost) {
    this.activePost = post;
  }

  closePost() {
    this.activePost = null;
  }

  toggleLike(id: string, e?: MouseEvent) {
    e?.stopPropagation();
    if (this.likedIds.has(id)) {
      this.likedIds.delete(id);
      this.toast.show('좋아요를 취소했습니다', 'info');
    } else {
      this.likedIds.add(id);
      this.toast.show('좋아요를 눌렀습니다', 'success');
    }
    this.likedIds = new Set(this.likedIds);
  }

  isLiked(id: string): boolean {
    return this.likedIds.has(id);
  }

  likeCount(post: CommunityPost): number {
    return post.likes + (this.isLiked(post.id) ? 1 : 0);
  }

  monogramColor(name: string): string {
    const colors = [
      'bg-indigo-100 text-indigo-700',
      'bg-amber-100 text-amber-800',
      'bg-emerald-100 text-emerald-700',
      'bg-rose-100 text-rose-700',
      'bg-sky-100 text-sky-700',
      'bg-violet-100 text-violet-700',
    ];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return colors[h % colors.length];
  }
}
