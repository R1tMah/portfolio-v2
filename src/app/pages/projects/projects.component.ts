// src/app/pages/projects/projects.component.ts
import { Component }        from '@angular/core';
import { CommonModule }     from '@angular/common';
import { RouterModule }     from '@angular/router';
import { MatCardModule }    from '@angular/material/card';
import { MatButtonModule }  from '@angular/material/button';
import { MatIconModule }    from '@angular/material/icon';
import { MatChipsModule }   from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectDetailComponent }     from './project-detail/project-detail.component';
import { Project }                   from '../../data/models';
import projectsData                  from '../../data/projects.json';


@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule, 
    MatDialogModule,
    ProjectDetailComponent,
  ],
  templateUrl: './projects.component.html',
  styleUrls:   ['./projects.component.scss']
})
export class ProjectsComponent {
  // 1) All projects
  constructor(private dialog: MatDialog) {}
  projects: Project[] = (projectsData as Project[]).filter(p => !p.hidden);

  // 2) Year filtering logic: a project belongs to every year its dateRange spans
  selectedYear: number | 'All' = 'All';

  yearGroups: { year: number; projects: Project[] }[] = this.groupByYear(this.projects);

  get visibleGroups() {
    return this.selectedYear === 'All'
      ? this.yearGroups
      : this.yearGroups.filter(g => g.year === this.selectedYear);
  }

  selectYear(year: number | 'All') {
    this.selectedYear = year;
  }

  private groupByYear(projects: Project[]) {
    const groups = new Map<number, Project[]>();
    for (const p of projects) {
      const found = (p.dateRange ?? '').match(/\b(19|20)\d{2}\b/g)?.map(Number) ?? [];
      if (!found.length) continue;
      for (let y = Math.min(...found); y <= Math.max(...found); y++) {
        groups.set(y, [...(groups.get(y) ?? []), p]);
      }
    }
    return [...groups.entries()]
      .sort(([a], [b]) => b - a)
      .map(([year, projects]) => ({ year, projects }));
  }

  // Avatar icon on each card, picked from the project's first tag
  private static TAG_ICONS: Record<string, string> = {
    'Full-Stack':   'web',
    'ML':           'psychology',
    'Data Science': 'insights',
    'CV':           'visibility',
    'NLP':          'chat',
  };

  iconFor(project: Project): string {
    return ProjectsComponent.TAG_ICONS[project.tags[0]] ?? 'code';
  }

  openDetails(project: Project) {
    this.dialog.open(ProjectDetailComponent, {
      data: project,
      width: '600px'
    });
  }
}
