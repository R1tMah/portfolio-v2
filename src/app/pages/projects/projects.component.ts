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

type Tag = 
  | 'Full-Stack'
  | 'ML'
  | 'Data Science'
  | 'Computer Vision'
  | 'NLP';

interface Project {
  title: string;
  dateRange?: string;
  bullets: string[];
  metrics?: string[];
  skills: string[];
  tags: string[];
  repoUrl?: string; 
}

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
  projects: Project[] = [
        {
      title: 'MindMap',
      dateRange: "Jan 2024 - October 2024",
      bullets: [
        'Developed a Flutter application that helps users schedule their day based on their mental health, motivation levels, and attention span.',
        'This information was gauged via a 15-question questionaire',
        'Recommends optimal working methods and study methods and lets users categorize daily tasks by type.',
        'Also incorporated an aspect that helps user with their study task based on the type of task (memorization, arithmetic, etc.)',
        'Includes a reminders page and a BeReal‑style calendar based on a SQLite database to review past schedules.'
      ],
      skills: ['Flutter','SQLite','OpenAI API'],
      tags: ['Full-Stack'], 
      repoUrl: "https://github.com/R1tMah/Schedule_Maker"
    },
    {
      title: 'Author Classification Project',
      dateRange: 'Apr 2025 – Apr 2025',
      bullets: [
        'Created an end‑to‑end NLP pipeline to match texts to authors like Austen & Twain.',
        'Cleaned 80+ texts with NLTK & spaCy; chunked into 5000 samples for training/testing.',
        'Tested embeddings (Word2Vec, Bag of Words, TF‑IDF) across 6 models to find top performers.',
        'Built a stacked Bi‑LSTM + attention model (94% accuracy) and fine‑tuned BERT‑base (92.5%).',
        'Performed topic modeling using LSA, LDA, and NMF to extract top 10 topics.',
        "Did this project as a part of the Minnodi LLC course",
      ],
      metrics: [
        'BoW → Logistic Regression: 97%',
        'BoW → Random Forest: 90%',
        'BoW → Gradient Boosting: 90%',
        'TF‑IDF → Logistic Regression: 97%',
        'TF‑IDF → KNN: 95%',
        'Word2Vec → Gradient Boosting: 82%'
      ],
      skills: ['BERT','Bi‑LSTM','Bag of Words','TF‑IDF','Word2Vec'],
      tags: ['NLP','ML'], 
      repoUrl: "https://github.com/R1tMah/author-classification"
    },
    {
      title: 'GiftLink',
      bullets: [
        'Built a full-stack MERN app connecting donors and seekers, with secure JWT authentication and dynamic user registration',
        'Developed RESTful microservices and NoSQL schemas to manage listings, profiles, and matchmaking, also incorporating a sentiment-analysis endpoint using the Natural library to gauge user feedback.',
        'Containerized and deployed the app using Docker and Kubernetes for scalable orchestration and production-readiness.',
        "Did this project as a part of the IBM JavaScript Full Stack Developer Course"
      ],
      skills: ['Node.js','Express','MongoDB','Docker', 'Kubernetes', 'React.js'],
      tags: ['Full-Stack'],
      repoUrl: 'https://github.com/R1tMah/giftlink'
    },
        {
      title: 'Analysis of Document Q‑A on SQuAD',
      dateRange: 'Jun 2025 – Jun 2025',
      bullets: [
        'Engineered an end-to-end RAG-A pipeline with  over 500 Wikipedia topics by combining DPR/FAISS and BM25 hybrid retrieval with cross-encoder re-ranking',
        'Built BERT-large extractive and GPT-3.5 generative QA systems with answer aggregation, achieving >65% EM',
        'Automated multi-metric evaluation (EM, F1, recall, relevancy, faithfulness) using LangChain & FAISS',
        "Did this project as a part of the Minnodi LLC course",
      ],
      skills: ['RAG','FAISS','BERT','GPT'],
      tags: ['NLP','ML','Data Science'], 
      repoUrl: "https://github.com/R1tMah/squad-qa-analysis"
    },
    {
      title: 'VoiceVilla',
      bullets: [
        'Developed a React.js platform for users to simulate calls with real-estate agents and see listings for ~200k U.S. properties.',
        'Integrated AWS Lex and Polly with AWS Lambda to provide voice transcription and conversational chatbot capabilities.',
        'Implemented retrieval from the Zillow API, optimizing response times and ensuring scalability for  property searches.', 
        "Created this during the BitCamp Hackathon"
      ],
      skills: ['React.js','AWS Lex','AWS Polly', 'AWS Lambda', "Node.js"],
      tags: ['Full-Stack','ML'], 
      repoUrl: "https://github.com/R1tMah/real-estate-assistant"
    },
        {
      title: "Ritvik's Portfolio v2",
      dateRange: 'Jul 2025 – Jul 2025',
      bullets: [
        'Built and deployed this Angular and FastAPI-based portfolio site',
        "Created an experience page featuring an interactive timeline of 17 technical projects and experiences",
        'Included a projects page with tagged filtering for around 14 projects',
        'Created Ritvik.AI, a chatbot that uses RAG on my resume and my experiences',
        'Created VibeMatch, a platform where users can compare their favorite 5 artists with mine.'
      ],
      skills: ['Angular','SCSS','Node.js','CI/CD', "Python", "FastAPI", "OpenAI API"],
      tags: ['Full-Stack', "ML", "NLP"], 
      repoUrl: "https://github.com/R1tMah/portfolio-v2"
    },

    {
      title: 'TuneTonic',
      dateRange: 'August 2024-October 2024',
      bullets: [
        'Developed a React.js application that predicts the emotional content of songs',
        'Completed this by training a sentiment analysis model on 150k+ lyrics to estimate Spotify Valence scores (0–1) with a loss of 0.025, using TensorFlow, scikit-learn, and Pandas',
        'Implemented a back-end system with Node.js, Express, and Flask and utilized React.js and Chart.js for frontend', 
        'One day I want to turn this into an Apple extension so whenever Apple Music Replay or Spotify Wrapped comes out we can do sentiment analysis on the type of music listened over the year.'
      ],
      skills: ['TensorFlow','Node.js','Flask','React.js'],
      tags: ['ML', 'Full-Stack', 'NLP'], 
      repoUrl: "https://github.com/R1tMah/song-lyrics-sentiment"
    },
    {
      title: 'NBA Game Predictor',
      dateRange: 'May 2024 – Jul 2024',
      bullets: [
        'Forecasted NBA game outcomes with 75% accuracy using scikit‑learn Logistic Regression.',
        'Engineered features from an NBA API with Pandas & NumPy and stored results in SQLAlchemy.',
        'Served predictions via a Flask app with a simple JavaScript frontend.',
      ],
      skills: ['Scikit‑Learn','Pandas','NumPy','Flask','JavaScript'],
      tags: ['Data Science','ML', 'Full-Stack'], 
      repoUrl: "https://github.com/R1tMah/basketball-predictor"
    },
    {
      title: 'Data Science Attrition Analysis',
      dateRange: 'Feb 2025 – Feb 2025',
      bullets: [
        'Analyzed employee attrition factors on a Kaggle dataset with matplotlib & seaborn.',
        'Created heatmaps, boxplots, and bar charts over 30 features to uncover key drivers.', 
        "Did this project as a part of the Minnodi LLC course",
      ],
      skills: ['Matplotlib','Seaborn','Python'],
      tags: ['Data Science'], 
      repoUrl: "https://github.com/R1tMah/data-science-attrition-analysis"
    },
    {
      title: 'Telecommunication Churn Analysis',
      dateRange: 'Mar 2025 – Mar 2025',
      bullets: [
        'Modeled customer churn using SMOTE for class balancing and GridSearchCV for hyperparameters.',
        'Applied SelectKBest & PCA for feature selection, achieving 93% accuracy with Gradient Boosting.',
        "Did this project as a part of the Minnodi LLC course",
      ],
      metrics: [
        'KNN: 92%','Decision Tree: 92%','Random Forest: 91%',
        'Gradient Boosting: 93%','XGBoost: 93%'
      ],
      skills: ['PCA','Python'],
      tags: ['Data Science','ML'], 
      repoUrl: "https://github.com/R1tMah/telecommunication-churn-analysis"
    },
    {
      title: 'Fruit Classification',
      dateRange: 'Apr 2025 – Apr 2025',
      bullets: [
        'Trained CNNs on the Fruits‑360 dataset to classify 160 classes with ~90% accuracy.',
        'Benchmarked three architectures and visualized results with matplotlib.',
        "Did this project as a part of the Minnodi LLC course",
      ],
      skills: ['Computer Vision','CNN','Matplotlib'],
      tags: ['ML','CV'], 
      repoUrl: "https://github.com/R1tMah/fruit-cnn", 
    },
    {
      title: 'NLI Analysis',
      dateRange: 'May 2025 – May 2025',
      bullets: [
        'Performed Natural Language Inference on 12K+ examples using BERT‑multilingual (62% accuracy).',
        'Fine‑tuned XLM‑RoBERTa for sequence classification (70% accuracy) and used ollama‑7b (64%).', 
        "Did this project as a part of the Minnodi LLC course",
      ],
      skills: ['BERT','XLM‑RoBERTa','NLI'],
      tags: ['NLP','ML'], 
      repoUrl: "https://github.com/R1tMah/nli-analysis"
    },
        {
      title: "Ritvik's Portfolio v1",
      dateRange: 'Sep 2024',
      bullets: [
        'Built and deployed a previous React.js portfolio',
        'Used Tailwind CSS for animations',
        'Website is now deprecated due to my newer version'
      ],
      skills: ['React.js','Tailwind CSS'],
      tags: ['Full-Stack'], 
      repoUrl: "https://github.com/R1tMah/Portfolio-Website-React"
    },

      {
      title: "Boston Marathon Clustering Project",
      dateRange: 'May 2025 – May 2025',
      bullets: [
        'Built an unsupervised learning project which does analysis on Boston Marathon times to find important patterns and trends. ',
        'Applied PCA and t-SNE for dimensionality reduction', 
        'Performed two different clustering algorithms: K-means and GMMs (Gaussian Mixture Models)',
        'Used silhouette scores to analyze the best amount of clusters to have, as well as the stronger algorithm.',
        'Analyzed multiple types of features such as age and gender',
        "Did this project as a part of the Minnodi LLC course",
      ],
      skills: ['PCA','t-sne','K-means','GMMs'],
      tags: ['Data Science'], 
      repoUrl: "https://github.com/R1tMah/boston-marathon-clustering"
    }
  ];

  // 2) Tag filtering logic
  selectedTag = 'All';
  allTags = [
    'All',
    'Full-Stack',
    'ML',
    'Data Science',
    'CV',
    'NLP'
  ];

  get filteredProjects(): Project[] {
    return this.selectedTag === 'All'
      ? this.projects
      : this.projects.filter(p => p.tags.includes(this.selectedTag));
  }

  selectTag(tag: string) {
    this.selectedTag = tag;
  }
  openDetails(project: Project) {
    this.dialog.open(ProjectDetailComponent, {
      data: project,
      width: '600px'
    });
  }
}
