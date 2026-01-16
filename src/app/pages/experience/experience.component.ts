import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule }   from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }   from '@angular/material/icon';
import { MatChipsModule }  from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';  // if you use dialogs
interface ExperienceEntry {
  monthLabel: string;       // e.g. "Aug 2023"
  projects?:    string[];     // project names
  courses?:     string[];     // course codes or titles
  certs?:       string[];     // e.g. "AWS Certified…"
  employer?:   string[];       // optional place you worked
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
  // Chronological list from earliest to latest
  timeline: ExperienceEntry[] = [
    {
      monthLabel: 'Aug 2023',
      courses:    ['CMSC132: Object Oriented Programming with Java', 'MATH461: Linear Algebra'],
    },
    {
      monthLabel: 'Sep 2023',
      courses:    ['CMSC132: Object Oriented Programming with Java', 'MATH461: Linear Algebra'],
    },
        {
      monthLabel: 'Oct 2023',
      courses:    ['CMSC132: Object Oriented Programming with Java', 'MATH461: Linear Algebra'],
    },
        {
      monthLabel: 'Nov 2023',
      courses:    ['CMSC132: Object Oriented Programming with Java','MATH461: Linear Algebra'],
    },
        {
      monthLabel: 'Dec 2023',
      courses:    ['CMSC132: Object Oriented Programming with Java', 'MATH461: Linear Algebra'],
    },
        {
      monthLabel: 'Jan 2024',
      employer:   ['STEM-E Web Development (Intern)'],
      projects:   ['MindMap'],
      courses:    ['CMSC216: Computer Systems with C and Assembly', 'CMSC250: Discrete Structures'],
    },
        {
      monthLabel: 'Feb 2024',
      employer:   ['STEM-E Web Development (Intern)'],
      projects:   ['MindMap'],
      courses:    ['CMSC216: Computer Systems with C and Assembly', 'CMSC250: Discrete Structures'],
    },
        {
      monthLabel: 'Mar 2024',
      employer:   ['STEM-E Web Development (Intern)'],
      projects:   ['MindMap'],
      courses:    ['CMSC216: Computer Systems with C and Assembly', 'CMSC250: Discrete Structures'],
    },
        {
      monthLabel: 'Apr 2024',
      employer:   ['STEM-E Web Development (Intern)'],
      projects:   ['MindMap'],
      courses:    ['CMSC216: Computer Systems with C and Assembly', 'CMSC250: Discrete Structures'],
    },
        {
      monthLabel: 'May 2024',
      employer:   ['STEM-E Web Development (Intern)'],
      projects:   ['MindMap', "NBA Game Predictor"],
      courses:    ['CMSC216: Computer Systems with C and Assembly', 'CMSC250: Discrete Structures'],
    },
        {
      monthLabel: 'Jun 2024',
      employer:   ['STEM-E Web Development (Intern)'],
      projects:   ['MindMap', "NBA Game Predictor"],
      certs:      ['IBM Introduction to Software Engineering', 'IBM Introduction to HTML, CSS, & JavaScript']
    },
        {
      monthLabel: 'Jul 2024',
      employer:   ['STEM-E Web Development (Intern)'],
      projects:   ['MindMap', "NBA Game Predictor", "TuneTonic"],
      certs:      ['IBM Getting Started with Git and GitHub', 'IBM JavaScript Programming Essentials']
    },
        {
      monthLabel: 'Aug 2024',
      employer:   ['STEM-E Web Development (Intern)'],
      projects:   ['MindMap', "TuneTonic"],
      certs:      ['IBM Developing Front-End Apps with React']
    },
        {
      monthLabel: 'Sep 2024',
      projects:   ['MindMap', 'TuneTonic', 'Portfolio v1 (with React)'],
      courses:    ['CMSC330: Organization of Programming Languages with oCaml and Rust ', 'CMSC351: Data Structures and Algorithms'],
    },
        {
      monthLabel: 'Oct 2024',
      projects:   ['MindMap', 'TuneTonic', "XFoundry"],
      courses:    ['CMSC330: Organization of Programming Languages with oCaml and Rust ', 'CMSC351: Data Structures and Algorithms'],
    },
        {
      monthLabel: 'Nov 2024',
      projects:   ['MindMap', "XFoundry"],
      courses:    ['CMSC330: Organization of Programming Languages with oCaml and Rust ', 'CMSC351: Data Structures and Algorithms' ],
    },
        {
      monthLabel: 'Dec 2024',
      projects:   ['MindMap', "XFoundry"],
      courses:    ['CMSC330: Organization of Programming Languages with oCaml and Rust ', 'CMSC351: Data Structures and Algorithms'],
    },
        {
      monthLabel: 'Jan 2025',
      employer:   ['Booz-Allen Hamilton --App Dev Club (Full Stack Engineer)'],
      projects:   ["XFoundry"],
      courses:    ['CMSC320: Intro to Data Science with Python', 'CMSC452: Elementary Theory of Computation',  "ECON306: Microeconomics"],
      certs:      ['Minnodi LLC Computer Vision, NLP, Agent Development Course']
    },
        {
      monthLabel: 'Feb 2025',
      employer:   ['Booz-Allen Hamilton --App Dev Club (Full Stack Engineer)'],
      projects:   ["XFoundry", "Data Science Attrition Analysis"],
      courses:    ['CMSC320: Intro to Data Science with Python', 'CMSC452: Elementary Theory of Computation',  "ECON306: Microeconomics"],
      certs:      ['Minnodi LLC Computer Vision, NLP, Agent Development Course']
    },
        {
      monthLabel: 'Mar 2025',
      employer:   ['Booz-Allen Hamilton --App Dev Club (Full Stack Engineer)'],
      projects:   ["Telecommunication Churn Analysis", "VoiceVilla"],
      courses:    ['CMSC320: Intro to Data Science with Python', 'CMSC452: Elementary Theory of Computation', "ECON306: Microeconomics"],
      certs:      ['Minnodi LLC Computer Vision, NLP, Agent Development Course']
    },
        {
      monthLabel: 'Apr 2025',
      employer:   ['Booz-Allen Hamilton --App Dev Club (Full Stack Engineer)'],
      projects:   ["Fruit Classification", "Author Classification"],
      courses:    ['CMSC320: Intro to Data Science with Python', 'CMSC452: Elementary Theory of Computation',  "ECON306: Microeconomics"],
      certs:      ['Minnodi LLC Computer Vision, NLP, Agent Development Course']
    },
    {
      monthLabel: 'May 2025',
      employer:   ['Booz-Allen Hamilton --App Dev Club (Full Stack Engineer)'],
      projects:   ["Boston Marathon Clustering Project", "NLI Analysis Project"],
      courses:    ['CMSC320: Intro to Data Science with Python', 'CMSC452: Elementary Theory of Computation',  "ECON306: Microeconomics"],
      certs:      ['Minnodi LLC Computer Vision, NLP, Agent Development Course', 'IBM Developing Back-End Apps with Node.js and Express', 'IBM Get Started with Cloud Native, DevOps, Agile, and NoSQL']
    },
    {
      monthLabel: 'Jun 2025',
      employer:   ['Minnodi LLC (AI/MLE Intern)'],
      projects:   ["SQuAD Dataset RAG-A Pipeline"],
      certs:      ['Minnodi LLC Computer Vision, NLP, Agent Development Course', 'IBM Introduction to Containers w/ Docker, Kubernetes & OpenShift', 'IBM Application Development using Microservices and Serverless']
    },
    {
      monthLabel: 'Jul 2025',
      employer:   ['Minnodi LLC (AI/MLE Intern)'],
      projects:   ["Ritvik's Portfolio v2 (with Angular)", "GiftLink"],
      certs:      ['IBM Node.js & MongoDB: Developing Back-end Database Applications', 'IBM Full Stack Developer Course fully completed (12 courses)']
    },
    {
      monthLabel: 'Aug 2025',
      employer:   ['Minnodi LLC (AI/MLE Intern)', 'Campus Coders Crew'],   
    },
    {
      monthLabel: 'Sep 2025',
      employer:   ['SENS Psychology', 'Campus Coders Crew', 'App Dev Club (Technical Project Lead) @ UMD Business School'], 
      courses:    ['CMSC422: Machine Learning', 'CMSC434: Human Computer Interaction', 'STAT401: Advanced Statistics'],   
    },
    {
      monthLabel: 'Oct 2025',
      employer:   ['SENS Psychology', 'App Dev Club (Technical Project Lead) @ UMD Business School'], 
      courses:    ['CMSC422: Machine Learning', 'CMSC434: Human Computer Interaction', 'STAT401: Advanced Statistics'],  
    },
    {
      monthLabel: 'Nov 2025',
      employer:   ['SENS Psychology', 'App Dev Club (Technical Project Lead) @ UMD Business School'], 
      courses:    ['CMSC422: Machine Learning', 'CMSC434: Human Computer Interaction', 'STAT401: Advanced Statistics'],  
    },
    {
      monthLabel: 'Dec 2025',
      employer:   ['SENS Psychology', 'App Dev Club (Technical Project Lead) @ UMD Business School'], 
      courses:    ['CMSC422: Machine Learning', 'CMSC434: Human Computer Interaction', 'STAT401: Advanced Statistics'],  
    }, 
    {
      monthLabel: 'Jan 2025',
      employer:   ['XCL SureStart Mentor'],   
    } 

  ];
}

