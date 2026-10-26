import { Routes } from '@angular/router';

// Dev-only content editor. Swapped for dev-routes.prod.ts in production builds.
export const devRoutes: Routes = [
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) }
];
