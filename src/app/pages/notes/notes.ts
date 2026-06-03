import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MarkdownModule } from 'ngx-markdown';
import { ToastService } from '../../components/toast/toast.service';
import hljs from 'highlight.js';

interface Note {
  id: string;
  weekId: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface WeekMeta {
  id: string;
  weekNumber: number;
  theme: string;
  description: string;
  tasks: { id: string; title: string }[];
}

const WEEKS: WeekMeta[] = [
  {
    id: 'w_1',
    weekNumber: 1,
    theme: 'JavaScript 핵심 개념 다지기',
    description:
      'React를 배우기 전 필수적인 모던 자바스크립트(ES6+) 문법과 동작 원리를 이해합니다.',
    tasks: [
      { id: 't_1_1', title: 'ES6+ 문법 (Arrow functions, Destructuring, Spread)' },
      { id: 't_1_2', title: '비동기 처리 (Promise, async/await)' },
      { id: 't_1_3', title: '실행 컨텍스트와 클로저 이해하기' },
    ],
  },
  {
    id: 'w_2',
    weekNumber: 2,
    theme: 'React 기초와 컴포넌트',
    description:
      'React의 핵심 개념인 JSX, 컴포넌트, Props, State를 학습하고 간단한 UI를 만들어봅니다.',
    tasks: [
      { id: 't_2_1', title: 'CRA 또는 Vite로 React 프로젝트 세팅' },
      { id: 't_2_2', title: 'useState와 useEffect 훅 마스터하기' },
      { id: 't_2_3', title: '간단한 Todo List 앱 만들기' },
    ],
  },
  {
    id: 'w_3',
    weekNumber: 3,
    theme: '상태 관리와 라우팅',
    description: '복잡한 애플리케이션을 위한 전역 상태 관리와 페이지 이동을 배웁니다.',
    tasks: [
      { id: 't_3_1', title: 'React Router DOM 적용하기' },
      { id: 't_3_2', title: 'Context API로 전역 상태 관리' },
      { id: 't_3_3', title: 'Zustand 또는 Redux Toolkit 기초' },
    ],
  },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'n_1',
    weekId: 'w_1',
    title: 'JavaScript 클로저 완벽 이해',
    content: `# 클로저(Closure)란?

클로저는 함수와 그 함수가 선언된 렉시컬 환경과의 조합이다.

## 핵심 개념
- 내부 함수가 외부 함수의 변수에 접근할 수 있다.
- 외부 함수가 반환된 후에도 내부 함수는 외부 함수의 변수를 기억한다.

\`\`\`javascript
function makeCounter() {
  let count = 0;
  return function() {
    return count++;
  };
}

const counter = makeCounter();
console.log(counter()); // 0
console.log(counter()); // 1
\`\`\`

## 활용 사례
1. 데이터 은닉 (Private variables)
2. 함수 팩토리
3. 이벤트 핸들러`,
    updatedAt: '2026-05-18T10:30:00Z',
  },
  {
    id: 'n_2',
    weekId: 'w_2',
    title: 'React Hooks 요약',
    content: `# React Hooks

## useState
상태를 관리하는 가장 기본적인 훅.

## useEffect
사이드 이펙트를 처리하는 훅. (데이터 페칭, 구독, DOM 조작 등)

*주의할 점: 의존성 배열(dependency array)을 정확히 관리해야 무한 루프를 방지할 수 있다.*`,
    updatedAt: '2026-05-19T14:20:00Z',
  },
];

@Component({
  selector: 'app-notes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [FormsModule, LucideAngularModule, MarkdownModule],
  templateUrl: './notes.html',
})
export class NotesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  notes: Note[] = [...INITIAL_NOTES];
  activeNoteId: string = INITIAL_NOTES[0].id;
  title: string = INITIAL_NOTES[0].title;
  content: string = INITIAL_NOTES[0].content;
  searchQuery: string = '';
  isSaving: boolean = false;

  get filteredNotes(): Note[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.notes;
    return this.notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
    );
  }

  ngOnInit() {
    setTimeout(() => this.cdr.detectChanges(), 0);

    this.route.queryParams.subscribe((params) => {
      const weekId = params['week'];
      if (!weekId) return;

      const existing = this.notes.find((n) => n.weekId === weekId);
      if (existing) {
        this.selectNote(existing);
      } else {
        const week = WEEKS.find((w) => w.id === weekId);
        if (week) {
          const newNote: Note = {
            id: `n_${Date.now()}`,
            weekId: week.id,
            title: `Week ${week.weekNumber}: ${week.theme}`,
            content: `# Week ${week.weekNumber}: ${week.theme}\n\n${week.description}\n\n## 학습 목표\n${week.tasks.map((t) => `- ${t.title}`).join('\n')}\n\n## 메모\n\n여기에 내용을 작성해보세요...`,
            updatedAt: new Date().toISOString(),
          };
          this.notes = [newNote, ...this.notes];
          this.selectNote(newNote);
          this.toast.show(`Week ${week.weekNumber} 노트를 새로 만들었습니다`, 'success');
        }
      }
      setTimeout(() => this.cdr.detectChanges(), 0);
    });
  }

  selectNote(note: Note) {
    this.activeNoteId = note.id;
    this.title = note.title;
    this.content = note.content;
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  save() {
    this.isSaving = true;
    setTimeout(() => {
      this.notes = this.notes.map((n) =>
        n.id === this.activeNoteId
          ? { ...n, title: this.title, content: this.content, updatedAt: new Date().toISOString() }
          : n,
      );
      this.isSaving = false;
      this.toast.show('노트가 저장되었습니다', 'success');
      this.cdr.detectChanges();
    }, 400);
  }

  newNote() {
    const note: Note = {
      id: `n_${Date.now()}`,
      weekId: 'w_1',
      title: '새로운 학습 노트',
      content: '# 새로운 학습 노트\n\n여기에 내용을 작성하세요...',
      updatedAt: new Date().toISOString(),
    };
    this.notes = [note, ...this.notes];
    this.selectNote(note);
  }

  weekLabel(weekId: string): string {
    const week = WEEKS.find((w) => w.id === weekId);
    return week ? `W${week.weekNumber}` : '';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ko-KR');
  }

  ngAfterViewChecked() {
    document.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el as HTMLElement);
    });
  }
}
