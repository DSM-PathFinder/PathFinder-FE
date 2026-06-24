import { Component, OnInit, AfterViewChecked, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MarkdownModule } from 'ngx-markdown';
import { NotesService, Note } from '../../services/notes';
import { ToastService } from '../../components/toast/toast.service';
import hljs from 'highlight.js';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, MarkdownModule],
  templateUrl: './notes.html',
})
export class NotesComponent implements OnInit, AfterViewChecked {
  private route = inject(ActivatedRoute);
  private notesService = inject(NotesService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  notes: Note[] = [];
  activeNoteId = '';
  title = '';
  content = '';
  titleLocked = false;
  searchQuery = '';
  isSaving = false;
  isLoading = true;

  get filteredNotes(): Note[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.notes;
    return this.notes.filter(
      (n) => n.title.toLowerCase().includes(q) || (n.content?.toLowerCase().includes(q) ?? false),
    );
  }

  ngOnInit() {
    this.isLoading = true;
    this.notesService.getAll().subscribe({
      next: (notes) => {
        this.notes = notes;
        this.isLoading = false;

        const params = this.route.snapshot.queryParams;
        const taskId = params['task'];
        const weekId = params['week'];
        const taskTitle = params['title'];

        if (taskId) {
          this.notesService.getByTask(taskId).subscribe({
            next: (note) => {
              if (note) {
                this.selectNote(note, true);
              } else {
                this.notesService
                  .create({
                    title: taskTitle ?? '학습 노트',
                    content: '',
                    taskId,
                    weekId: weekId ?? undefined,
                  })
                  .subscribe({
                    next: (newNote) => {
                      this.notes = [newNote, ...this.notes];
                      this.selectNote(newNote, true);
                      this.cdr.detectChanges();
                    },
                    error: () => this.toast.show('노트 생성에 실패했습니다', 'error'),
                  });
              }
              this.cdr.detectChanges();
            },
          });
        } else if (weekId) {
          const existing = this.notes.find((n) => n.weekId === weekId && !n.taskId);
          if (existing) {
            this.selectNote(existing, false);
          } else {
            this.notesService
              .create({
                title: `Week 학습 노트`,
                content: '# 학습 노트\n\n여기에 내용을 작성해보세요...',
                weekId,
              })
              .subscribe({
                next: (note) => {
                  this.notes = [note, ...this.notes];
                  this.selectNote(note, false);
                  this.cdr.detectChanges();
                },
              });
          }
        } else if (notes.length > 0) {
          this.selectNote(notes[0], !!notes[0].taskId);
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  ngAfterViewChecked() {
    document.querySelectorAll('pre code:not([data-highlighted])').forEach((el) => {
      (el as HTMLElement).dataset['highlighted'] = 'true';
      hljs.highlightElement(el as HTMLElement);
    });
  }

  selectNote(note: Note, locked = false) {
    this.activeNoteId = note.id;
    this.title = note.title;
    this.content = note.content ?? '';
    this.titleLocked = locked || !!note.taskId;
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  save() {
    if (!this.activeNoteId) return;
    this.isSaving = true;
    this.notesService
      .update(this.activeNoteId, {
        title: this.titleLocked ? this.title : this.title,
        content: this.content,
      })
      .subscribe({
        next: (updated) => {
          this.notes = this.notes.map((n) => (n.id === updated.id ? updated : n));
          this.isSaving = false;
          this.toast.show('저장되었습니다 ✓', 'success');
          this.cdr.detectChanges();
        },
        error: () => {
          this.isSaving = false;
          this.toast.show('저장에 실패했습니다', 'error');
          this.cdr.detectChanges();
        },
      });
  }

  newNote() {
    this.notesService
      .create({
        title: '새로운 학습 노트',
        content: '# 새로운 학습 노트\n\n여기에 내용을 작성하세요...',
      })
      .subscribe({
        next: (note) => {
          this.notes = [note, ...this.notes];
          this.selectNote(note, false);
          this.cdr.detectChanges();
        },
        error: () => this.toast.show('노트 생성에 실패했습니다', 'error'),
      });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('ko-KR');
  }
}
