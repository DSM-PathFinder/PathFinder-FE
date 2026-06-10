import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly baseUrl = 'http://localhost:3000/api';

  constructor(public http: HttpClient) {}

  get<T>(path: string) {
    return this.http.get<T>(`${this.baseUrl}${path}`);
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  patch<T>(path: string, body: any) {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }
}
