// src/app/services/api.service.ts

import { Injectable }             from '@angular/core';
import { HttpClient }             from '@angular/common/http';
import { Observable }             from 'rxjs';

export interface ChatRequest {
  question: string;
  chat_history: any[];
}

export interface ChatResponse {
  answer: string;
  chat_history: any[];
}

export interface VibeMatchReq {
  artists: string[];
}

export interface VibeMatchRes {
  score: number;
  caption: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '/api';  // adjust for prod

  constructor(private http: HttpClient) {}

  /** RAG chat endpoint */
  chat(req: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.base}/chat`, req);
  }

  /** VibeMatch endpoint */
  vibematch(req: VibeMatchReq): Observable<VibeMatchRes> {
    return this.http.post<VibeMatchRes>(`${this.base}/vibematch`, req);
  }
}
