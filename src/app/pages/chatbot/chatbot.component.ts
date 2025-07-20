// src/app/pages/chatbot/chatbot.component.ts

import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule }           from '@angular/material/card';
import { MatFormFieldModule }      from '@angular/material/form-field';
import { MatInputModule }          from '@angular/material/input';
import { MatButtonModule }         from '@angular/material/button';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { ApiService, ChatResponse } from '../../services/api.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    // Angular
    CommonModule,
    ReactiveFormsModule,
     
    // Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './chatbot.component.html',
  styleUrls:   ['./chatbot.component.scss']
})
export class ChatbotComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  chatForm = new FormGroup({
    question: new FormControl('')
  });

  history: { from: 'user'|'bot'; text: string }[] = [];
  loading = false;

  constructor(private api: ApiService) {}

  send() {
    const q = this.chatForm.value.question?.trim();
    if (!q || this.loading) return;

    this.history.push({ from: 'user', text: q });
    this.chatForm.reset();
    this.loading = true;
    this.scrollToBottom();

    this.api.chat({ question: q, chat_history: [] }).subscribe({
      next: (res: ChatResponse) => {
        this.history.push({ from: 'bot', text: res.answer });
        this.loading = false;
        this.scrollToBottom();
      },
      error: () => {
        this.history.push({ from: 'bot', text: '😞 Sorry, something went wrong.' });
        this.loading = false;
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }
}
