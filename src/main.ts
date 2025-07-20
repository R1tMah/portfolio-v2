import 'zone.js';  
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter }       from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations }   from '@angular/platform-browser/animations';

import { AppComponent }    from './app/app.component';
import { routes }          from './app/app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule }  from '@angular/material/button';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withFetch(),                // ← enable Fetch in the browser
      withInterceptorsFromDi()
    ),
    provideRouter(routes),
    importProvidersFrom(
      BrowserAnimationsModule,
      MatToolbarModule,
      MatButtonModule
    ),
    provideAnimations(),
  ]
}).catch(err => console.error(err));
