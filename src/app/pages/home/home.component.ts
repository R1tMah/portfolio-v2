// src/app/pages/home/home.component.ts
import { Component, AfterViewInit, ViewChild, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { RouterModule }          from '@angular/router';
import { MatIconModule }         from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule }       from '@angular/material/button';
import { MatCardModule }         from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,    // for routerLink
    MatIconModule,   // for <mat-icon>
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './home.component.html',
  styleUrls:   ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('details', { static: true }) details!: ElementRef<HTMLElement>;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  bioCards = [
    { icon: 'school',            title: 'Education',      text: 'CS major & Econ minor @ UMD, graduating May 2027' },
    { icon: 'work',              title: 'Experience',     text: 'Ex-IBM and Flexcar engineer working on production backend and agentic features' },
    { icon: 'handshake',         title: 'What I want',    text: 'I prioritize ownership, mentorship, and a fast user feedback loop' },
    { icon: 'sports_basketball', title: 'Hobbies',        text: 'Basketball, chess, and board games' },
  ];

  ngAfterViewInit() {
    const el = this.details.nativeElement;

    if (this.isBrowser && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver(([entry], o) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          o.disconnect();
        }
      }, { threshold: 0.1 });
      obs.observe(el);

      // If already scrolled into view on reload, show immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
        el.classList.add('visible');
        obs.disconnect();
      }
    } else {
      el.classList.add('visible');
    }
  }
}
