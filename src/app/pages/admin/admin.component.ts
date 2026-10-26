// src/app/pages/admin/admin.component.ts
// Dev-only content editor. Only routed when environment.production is false,
// and needs `npm run dev` so the /dev-admin API can write the JSON files.
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { HttpClient }      from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }   from '@angular/material/icon';
import {
  CardSection, CARD_SECTIONS, ExperienceCard, ExperienceEntry, Project, PROJECT_TAGS
} from '../../data/models';

type Tab = 'projects' | 'timeline' | 'cards';
type ListKey = 'employer' | 'projects' | 'courses' | 'certs';

interface ProjectDraft {
  title: string;
  dateRange: string;
  repoUrl: string;
  bullets: string;
  metrics: string;
  skills: string;
  tags: string[];
}

interface CardDraft {
  section: CardSection;
  title: string;
  logo: string;
  bullets: string;
  skills: string;
}

interface TimelineDraft {
  monthLabel: string;
  employer: string;
  projects: string;
  courses: string;
  certs: string;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const LIST_KEYS: ListKey[] = ['employer', 'projects', 'courses', 'certs'];

const toLines = (text: string) => text.split('\n').map(s => s.trim()).filter(Boolean);
const toCommaList = (text: string) => text.split(',').map(s => s.trim()).filter(Boolean);

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './admin.component.html',
  styleUrls:   ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);

  tab: Tab = 'projects';
  allTags = PROJECT_TAGS;
  cardSections = CARD_SECTIONS;
  listFields: { key: ListKey; label: string }[] = [
    { key: 'employer', label: 'Work experience' },
    { key: 'projects', label: 'Projects' },
    { key: 'courses',  label: 'Courses' },
    { key: 'certs',    label: 'Certs' },
  ];

  projects: Project[] = [];
  timeline: ExperienceEntry[] = [];
  cards: ExperienceCard[] = [];
  dirty: Record<Tab, boolean> = { projects: false, timeline: false, cards: false };
  status = '';
  error = '';

  selectedProject = -1;
  projectDraft: ProjectDraft | null = null;
  selectedMonth = -1;
  monthDraft: TimelineDraft | null = null;
  selectedCard = -1;
  cardDraft: CardDraft | null = null;

  ngOnInit() {
    this.http.get<Project[]>('/dev-admin/projects').subscribe({
      next: data => this.projects = data,
      error: () => this.error = 'Could not reach the dev API. Start the site with "npm run dev".'
    });
    this.http.get<ExperienceEntry[]>('/dev-admin/timeline').subscribe({
      next: data => this.timeline = data,
      error: () => this.error = 'Could not reach the dev API. Start the site with "npm run dev".'
    });
    this.http.get<ExperienceCard[]>('/dev-admin/cards').subscribe({
      next: data => this.cards = data,
      error: () => this.error = 'Could not reach the dev API. Start the site with "npm run dev".'
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  warnUnsaved(event: BeforeUnloadEvent) {
    if (this.dirty.projects || this.dirty.timeline || this.dirty.cards) event.preventDefault();
  }

  save(tab: Tab) {
    const body = { projects: this.projects, timeline: this.timeline, cards: this.cards }[tab];
    this.http.put(`/dev-admin/${tab}`, body).subscribe({
      next: () => {
        this.dirty[tab] = false;
        this.flash(`Saved ${tab}.json — the site will reload with your changes.`);
      },
      error: err => this.error = err.error?.errors
        ? `Not saved, ${tab}.json has problems: ${err.error.errors.join(' · ')}`
        : `Saving ${tab}.json failed. Is "npm run dev" running?`
    });
  }

  // ---- Projects ----

  selectProject(i: number) {
    this.selectedProject = i;
    const p = this.projects[i];
    this.projectDraft = {
      title: p.title,
      dateRange: p.dateRange ?? '',
      repoUrl: p.repoUrl ?? '',
      bullets: p.bullets.join('\n'),
      metrics: (p.metrics ?? []).join('\n'),
      skills: p.skills.join(', '),
      tags: [...p.tags],
    };
  }

  addProject() {
    this.projects.unshift({ title: 'New project', bullets: [], skills: [], tags: [] });
    this.dirty.projects = true;
    this.selectProject(0);
  }

  // Write the draft back into the project after every keystroke.
  applyProject() {
    const d = this.projectDraft;
    if (!d || this.selectedProject < 0) return;
    const p: Project = {
      title: d.title.trim(),
      bullets: toLines(d.bullets),
      skills: toCommaList(d.skills),
      tags: d.tags,
    };
    if (d.dateRange.trim()) p.dateRange = d.dateRange.trim();
    if (toLines(d.metrics).length) p.metrics = toLines(d.metrics);
    if (d.repoUrl.trim()) p.repoUrl = d.repoUrl.trim();
    if (this.projects[this.selectedProject].hidden) p.hidden = true;
    this.projects[this.selectedProject] = p;
    this.dirty.projects = true;
  }

  toggleTag(tag: string) {
    if (!this.projectDraft) return;
    const tags = this.projectDraft.tags;
    this.projectDraft.tags = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag];
    this.applyProject();
  }

  deleteProject(i: number) {
    if (!confirm(`Delete "${this.projects[i].title}"?`)) return;
    this.projects.splice(i, 1);
    this.dirty.projects = true;
    this.selectedProject = -1;
    this.projectDraft = null;
  }

  moveProject(i: number, delta: number) {
    this.selectedProject = this.move(this.projects, i, delta, this.selectedProject);
    this.dirty.projects = true;
  }

  // ---- Timeline ----

  selectMonth(i: number) {
    this.selectedMonth = i;
    const e = this.timeline[i];
    this.monthDraft = {
      monthLabel: e.monthLabel,
      employer: (e.employer ?? []).join('\n'),
      projects: (e.projects ?? []).join('\n'),
      courses: (e.courses ?? []).join('\n'),
      certs: (e.certs ?? []).join('\n'),
    };
  }

  // Months usually carry over the same job and classes, so copy the last one.
  addMonth() {
    const last = this.timeline[this.timeline.length - 1];
    const entry: ExperienceEntry = { monthLabel: this.nextMonthLabel(last?.monthLabel) };
    for (const key of LIST_KEYS) {
      if (key !== 'projects' && key !== 'certs' && last?.[key]?.length) entry[key] = [...last[key]!];
    }
    this.timeline.push(entry);
    this.dirty.timeline = true;
    this.selectMonth(this.timeline.length - 1);
  }

  applyMonth() {
    const d = this.monthDraft;
    if (!d || this.selectedMonth < 0) return;
    const entry: ExperienceEntry = { monthLabel: d.monthLabel.trim().replace(/\s+/g, ' ') };
    for (const key of LIST_KEYS) {
      const items = toLines(d[key]);
      if (items.length) entry[key] = items;
    }
    if (this.timeline[this.selectedMonth].hidden) entry.hidden = true;
    this.timeline[this.selectedMonth] = entry;
    this.dirty.timeline = true;
  }

  deleteMonth(i: number) {
    if (!confirm(`Delete ${this.timeline[i].monthLabel}?`)) return;
    this.timeline.splice(i, 1);
    this.dirty.timeline = true;
    this.selectedMonth = -1;
    this.monthDraft = null;
  }

  moveMonth(i: number, delta: number) {
    this.selectedMonth = this.move(this.timeline, i, delta, this.selectedMonth);
    this.dirty.timeline = true;
  }

  monthSummary(e: ExperienceEntry): string {
    return LIST_KEYS.map(k => e[k]?.length ?? 0).reduce((a, b) => a + b, 0) + ' items';
  }

  // ---- Experience cards ----

  get logoOptions(): string[] {
    return [...new Set(this.cards.map(c => c.logo).filter(Boolean))];
  }

  sectionLabel(section: CardSection): string {
    return CARD_SECTIONS.find(s => s.key === section)?.label ?? section;
  }

  selectCard(i: number) {
    this.selectedCard = i;
    const c = this.cards[i];
    this.cardDraft = {
      section: c.section,
      title: c.title,
      logo: c.logo,
      bullets: c.bullets.join('\n'),
      skills: c.skills.join(', '),
    };
  }

  addCard() {
    this.cards.unshift({ section: 'experience', title: 'New role @ Company', logo: '', bullets: [], skills: [] });
    this.dirty.cards = true;
    this.selectCard(0);
  }

  applyCard() {
    const d = this.cardDraft;
    if (!d || this.selectedCard < 0) return;
    const card: ExperienceCard = {
      section: d.section,
      title: d.title.trim(),
      logo: d.logo.trim(),
      bullets: toLines(d.bullets),
      skills: toCommaList(d.skills),
    };
    if (this.cards[this.selectedCard].hidden) card.hidden = true;
    this.cards[this.selectedCard] = card;
    this.dirty.cards = true;
  }

  deleteCard(i: number) {
    if (!confirm(`Delete "${this.cards[i].title}"?`)) return;
    this.cards.splice(i, 1);
    this.dirty.cards = true;
    this.selectedCard = -1;
    this.cardDraft = null;
  }

  moveCard(i: number, delta: number) {
    this.selectedCard = this.move(this.cards, i, delta, this.selectedCard);
    this.dirty.cards = true;
  }

  uploading = false;

  uploadLogo(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.cardDraft) return;
    const draft = this.cardDraft;
    this.uploading = true;
    this.http.post<{ path: string }>(`/dev-admin/upload?name=${encodeURIComponent(file.name)}`, file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' }
    }).subscribe({
      next: res => {
        this.uploading = false;
        draft.logo = res.path;
        if (this.cardDraft === draft) this.applyCard();
        this.flash(`Uploaded ${res.path}. Press Save to keep it on the card.`);
      },
      error: err => {
        this.uploading = false;
        this.error = `Upload failed: ${err.error?.error ?? 'is "npm run dev" running?'}`;
      }
    });
  }

  // ---- Hide / show ----

  // Hidden items stay in the JSON (and here) but the site skips them.
  toggleHidden(tab: Tab, item: { hidden?: boolean }) {
    if (item.hidden) delete item.hidden;
    else item.hidden = true;
    this.dirty[tab] = true;
  }

  // ---- helpers ----

  private move<T>(list: T[], i: number, delta: number, selected: number): number {
    const j = i + delta;
    if (j < 0 || j >= list.length) return selected;
    [list[i], list[j]] = [list[j], list[i]];
    if (selected === i) return j;
    if (selected === j) return i;
    return selected;
  }

  private nextMonthLabel(label?: string): string {
    const match = label?.trim().match(/^(\w{3})\s+(\d{4})$/);
    const idx = match ? MONTHS.indexOf(match[1]) : -1;
    if (!match || idx < 0) return '';
    const year = Number(match[2]) + (idx === 11 ? 1 : 0);
    return `${MONTHS[(idx + 1) % 12]} ${year}`;
  }

  private flash(msg: string) {
    this.error = '';
    this.status = msg;
    setTimeout(() => { if (this.status === msg) this.status = ''; }, 4000);
  }
}
