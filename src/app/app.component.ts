import { RouterOutlet, NavigationEnd  } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { Component, AfterViewInit, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT ,isPlatformBrowser } from '@angular/common';
import { FooterComponent } from './layout/footer/footer.component';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './services/api.service';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
@Component({
  standalone: true,
  imports: [ HeaderComponent, RouterOutlet, FooterComponent, HttpClientModule,],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements AfterViewInit {
  constructor(private api: ApiService) {}
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private stars: { x: number; y: number; r: number; alpha: number; dAlpha: number }[] = [];
  private numStars = 200;
  private router = inject(Router);
  private doc = inject(DOCUMENT);
  
  

  ngAfterViewInit() {
     if (!this.isBrowser) {
      // skip starfield logic on server
      return;
    }
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.api.healthCheck().subscribe({
      next: () => console.log('💚 Backend is awake'),
      error: err => console.warn('⚠️ Health check failed', err),
    });
    this.canvas = document.getElementById('starfield') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.resize();
    this.initStars();
    requestAnimationFrame(this.animate.bind(this));
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => {
          // turn off smooth behavior for this programmatic jump
          (this.doc.documentElement as HTMLElement).style.scrollBehavior = 'auto';
          window.scrollTo({ top: 0, left: 0 });
          // restore whatever CSS you had
          (this.doc.documentElement as HTMLElement).style.scrollBehavior = '';
        });
  }

  @HostListener('window:resize')
  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private initStars() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      const r = Math.random() * 1.2 + 0.5;     // radius between 0.5–1.7
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r,
        alpha: Math.random(),
        dAlpha: (Math.random() * 0.02) + 0.005   // twinkle speed
      });
    }
  }

  private animate() {
    const { ctx, canvas, stars } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      // update opacity
      s.alpha += s.dAlpha;
      if (s.alpha <= 0 || s.alpha >= 1) s.dAlpha = -s.dAlpha;
      // draw
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(this.animate.bind(this));
  }
}
