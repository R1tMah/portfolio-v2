// src/app/services/spotify.service.ts
import { Injectable } from '@angular/core';
import { HttpClient }   from '@angular/common/http';
import { Observable }   from 'rxjs';
import { map }             from 'rxjs/operators';
import { tap }             from 'rxjs/operators';
import { environment } from '../../environments/environment';
export interface Artist { id: string; name: string; image?: string; }

@Injectable({providedIn: 'root'})
export class SpotifyService {

  constructor(private http: HttpClient) {}

    searchArtists(q: string, limit = 10) {
    return this.http.get<Artist[]>(
      `${environment.apiBase}/spotify/search`,
      { params: { q, limit: limit.toString() } }
    );
    }
}