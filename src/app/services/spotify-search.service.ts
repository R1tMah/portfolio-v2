// src/app/services/spotify.service.ts
import { Injectable } from '@angular/core';
import { HttpClient }   from '@angular/common/http';
import { Observable }   from 'rxjs';
import { map }             from 'rxjs/operators';
import { tap }             from 'rxjs/operators';
export interface Artist { id: string; name: string; image?: string; }

@Injectable({providedIn: 'root'})
export class SpotifyService {
  private base = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

    searchArtists(q: string, limit = 10) {
    return this.http.get<Artist[]>(
      `${this.base}/spotify/search`,
      { params: { q, limit: limit.toString() } }
    );
    }
}