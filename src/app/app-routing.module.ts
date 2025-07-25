// src/app/app-routing.module.ts
import { NgModule }             from '@angular/core';
import { RouterModule }         from '@angular/router';
import { routes }               from './app.routes';

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled', // ← scroll to top on every navigation
      anchorScrolling: 'enabled',           // ← support fragment links (#foo)
      scrollOffset: [0, 0]                  // ← adjust if you have sticky headers
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
