import { Routes } from '@angular/router';
import { HomeComponent }       from './pages/home/home.component';
import { ExperienceComponent } from './pages/experience/experience.component';
import { ProjectsComponent }  from './pages/projects/projects.component';
import { ChatbotComponent }   from './pages/chatbot/chatbot.component';
import { VibematchComponent } from './pages/vibematch/vibematch.component';
import { ContactComponent }   from './pages/contact/contact.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

export const routes: Routes = [
  { path: '',            component: HomeComponent },
  { path: 'experience',  component: ExperienceComponent },
  { path: 'projects',    component: ProjectsComponent },
  { path: 'chatbot',     component: ChatbotComponent },
  { path: 'vibematch',   component: VibematchComponent },
  { path: 'contact',     component: ContactComponent },
  // Content editor. Locally it saves files (npm run dev); deployed it's behind basic auth
  // and commits to GitHub (netlify/functions/content-api.mjs).
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) },
  { path: '**',          redirectTo: '', pathMatch: 'full' }
];

