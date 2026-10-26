// Shared shapes for the content in projects.json, timeline.json and cards.json.
// Edit the content through the dev-only /admin page (npm run dev), or commit the
// JSON from another app (see docs/CONTENT_UPDATES.md). The JSON Schemas in
// ./schema are the contract; keep these interfaces in sync with them.
import projectsSchema from './schema/projects.schema.json';

export interface Project {
  title: string;
  dateRange?: string;
  bullets: string[];
  metrics?: string[];
  skills: string[];
  tags: string[];
  repoUrl?: string;
  hidden?: boolean;         // kept in the data, not shown on the site
}

export interface ExperienceEntry {
  monthLabel: string;       // e.g. "Aug 2023"
  projects?:  string[];     // project names
  courses?:   string[];     // course codes or titles
  certs?:     string[];     // e.g. "AWS Certified…"
  employer?:  string[];     // places you worked
  hidden?:    boolean;      // kept in the data, not shown on the site
}

// Tag list lives in the schema so the site, the editor and the validator agree.
export const PROJECT_TAGS: string[] = projectsSchema.items.properties.tags.items.enum;

export type CardSection = 'experience' | 'certification';

export const CARD_SECTIONS: { key: CardSection; label: string }[] = [
  { key: 'experience',    label: 'Experiences' },
  { key: 'certification', label: 'Certifications' },
];

// A detail card on the left side of the Experience page.
export interface ExperienceCard {
  section: CardSection;
  title: string;
  logo: string;             // path under assets/, e.g. "assets/ibm.png"
  bullets: string[];
  skills: string[];
  hidden?: boolean;         // kept in the data, not shown on the site
}
