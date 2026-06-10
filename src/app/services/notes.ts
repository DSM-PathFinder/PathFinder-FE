import { Injectable } from '@angular/core';
import { ApiService } from './api';

export interface Note {
  id: string;
  title: string;
  content: string;
  weekId?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get<Note[]>('/notes');
  }

  getOne(id: string) {
    return this.api.get<Note>(`/notes/${id}`);
  }

  create(data: { title: string; content?: string; weekId?: string }) {
    return this.api.post<Note>('/notes', data);
  }

  update(id: string, data: { title?: string; content?: string }) {
    return this.api.patch<Note>(`/notes/${id}`, data);
  }

  remove(id: string) {
    return this.api.delete(`/notes/${id}`);
  }
}
