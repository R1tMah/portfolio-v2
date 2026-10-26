import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule }   from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }   from '@angular/material/icon';
import { MatChipsModule }  from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';  // if you use dialogs
import { CardSection, CARD_SECTIONS, ExperienceCard, ExperienceEntry } from '../../data/models';
import timelineData from '../../data/timeline.json';
import cardsData from '../../data/cards.json';

interface TimelineRow {
  month: string;
  label: string;
  icon: string;
  items: string[];
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// monthLabel looks like "Aug 2023"; split on any whitespace so odd spaces don't break it
const partsOf = (e: ExperienceEntry) => e.monthLabel.trim().split(/\s+/);
const yearOf  = (e: ExperienceEntry) => Number(partsOf(e)[1]);
const monthOf = (e: ExperienceEntry) => MONTHS.indexOf(partsOf(e)[0]);

// Show only what mattered most that month: work, else courses, else certs + projects.
function toRow(e: ExperienceEntry): TimelineRow | null {
  const month = partsOf(e)[0];
  if (e.employer?.length) return { month, label: 'Work', icon: 'work', items: e.employer };
  if (e.courses?.length)  return { month, label: 'Courses', icon: 'school', items: e.courses };
  const certs = e.certs ?? [], projects = e.projects ?? [];
  if (!certs.length && !projects.length) return null;
  const label = certs.length && projects.length ? 'Certs & projects' : certs.length ? 'Certs' : 'Projects';
  return { month, label, icon: certs.length ? 'workspace_premium' : 'code', items: [...certs, ...projects] };
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule,     
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule, 
    MatCardModule,
  ],
  templateUrl: './experience.component.html',
  styleUrls:   ['./experience.component.scss']
})
export class ExperienceComponent {
  // Visible months, grouped into years (newest first) for the year picker
  timeline: ExperienceEntry[] = (timelineData as ExperienceEntry[]).filter(e => !e.hidden);
  years: number[] = [...new Set(this.timeline.map(yearOf))].filter(y => !isNaN(y)).sort((a, b) => b - a);
  selectedYear = this.years[0];

  get monthsInYear(): TimelineRow[] {
    return this.timeline
      .filter(e => yearOf(e) === this.selectedYear)
      .sort((a, b) => monthOf(b) - monthOf(a))
      .map(toRow)
      .filter((row): row is TimelineRow => row !== null);
  }

  // Detail cards on the left, grouped into Experiences / Certifications
  cards = (cardsData as ExperienceCard[]).filter(c => !c.hidden);
  sections = CARD_SECTIONS;

  cardsIn(section: CardSection): ExperienceCard[] {
    return this.cards.filter(c => c.section === section);
  }

  // Titles look like "Role @ Company"; show the company as the title and the role underneath
  companyOf(card: ExperienceCard): string {
    return card.title.split(' @ ')[1]?.trim() || card.title;
  }

  roleOf(card: ExperienceCard): string {
    return card.title.includes(' @ ') ? card.title.split(' @ ')[0].trim() : '';
  }
}

