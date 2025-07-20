import { Component, Inject }        from '@angular/core';
import { MAT_DIALOG_DATA }          from '@angular/material/dialog';
import { MatDialogModule }          from '@angular/material/dialog';
import { MatButtonModule }          from '@angular/material/button';
import { MatIconModule }            from '@angular/material/icon';
import { MatChipsModule }           from '@angular/material/chips';
import { CommonModule }             from '@angular/common';

interface Project {
  title: string;
  dateRange?: string;
  bullets: string[];
  metrics?:   string[];
  skills:     string[];
  tags:       string[];
}

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './project-detail.component.html',
  styleUrls:   ['./project-detail.component.scss']
})
export class ProjectDetailComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public project: Project) {}
}
