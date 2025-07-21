// src/app/services/api.service.ts

import { Injectable }             from '@angular/core';
import { HttpClient }             from '@angular/common/http';
import { Observable }             from 'rxjs';
import { environment } from '../../environments/environment';

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
  constructor(private http: HttpClient) {}
  vibematch(req: VibeMatchReq) {
    return this.http.post<VibeMatchRes>(
      `${environment.apiBase}/vibematch`,
      req
    );
  }
  chat(req: ChatRequest) {
    return this.http.post<ChatResponse>(
      `${environment.apiBase}/chat`,
      req
    );
  }
}