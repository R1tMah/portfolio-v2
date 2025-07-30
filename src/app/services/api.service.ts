// src/app/services/api.service.ts

import { Injectable }             from '@angular/core';
import { HttpClient }             from '@angular/common/http';
import { Observable }             from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatRequest {
  question: string;
  chat_history: any[];
}
export interface Rec {
  title: string;
  artist: string;       // JSON‑stringified array sometimes or single name
  album_image: string;  // you can ignore or show a placeholder
  sim_score: number;
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
  recommendations: Rec[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  
  constructor(private http: HttpClient) {}
  
  vibematch(req: VibeMatchReq) {
    return this.http.post<VibeMatchRes>(
      `${environment.apiBase}/vibe-and-recommend`,
      req
    );
  }
  chat(req: ChatRequest) {
    console.log('Calling API:', `${environment.apiBase}/chat`, req);
    return this.http.post<ChatResponse>(
      `${environment.apiBase}/chat`,
      req
    );
  }
  healthCheck(): Observable<{ ok: boolean }> {
    return this.http.get<{ ok: boolean }>(`${environment.apiBase}/health`);
  }
}