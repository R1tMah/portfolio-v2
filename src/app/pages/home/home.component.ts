// src/app/pages/home/home.component.ts
import { Component, AfterViewInit, ViewChild, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { RouterModule }          from '@angular/router';
import { MatIconModule }         from '@angular/material/icon';
import { isPlatformBrowser }     from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,    // for routerLink
    MatIconModule    // for <mat-icon>
  ],
  templateUrl: './home.component.html',
  styleUrls:   ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('details', { static: true }) details!: ElementRef<HTMLElement>;
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

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
