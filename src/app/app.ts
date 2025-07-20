
import { bootstrapApplication }        from '@angular/platform-browser';
import { importProvidersFrom }         from '@angular/core';
import { provideRouter }               from '@angular/router';
import { BrowserAnimationsModule }     from '@angular/platform-browser/animations';
import { MatToolbarModule }            from '@angular/material/toolbar';
import { MatButtonModule }             from '@angular/material/button';
import { provideAnimations }    from '@angular/platform-browser/animations';
import { AppComponent }    from './app.component';
import { routes }       from './app.routes';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withFetch(),               // ← enable Fetch under SSR
      withInterceptorsFromDi()    // ← keep any HTTP interceptors you’ve registered
    ),
    provideRouter(routes),
    importProvidersFrom(
      BrowserAnimationsModule,
      MatToolbarModule,
      MatButtonModule,
      // …any other Material modules you need…
    ),
    provideAnimations(),  
  ]
}).catch(err => console.error(err));
