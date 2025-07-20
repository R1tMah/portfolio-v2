import { Component }         from '@angular/core';
import { CommonModule }      from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule
} from '@angular/forms';
import { MatFormFieldModule }        from '@angular/material/form-field';
import { MatInputModule }            from '@angular/material/input';
import { MatButtonModule }           from '@angular/material/button';
import { MatCardModule }             from '@angular/material/card';
import { MatProgressSpinnerModule }  from '@angular/material/progress-spinner';

import { ApiService, VibeMatchRes } from '../../services/api.service';

@Component({
  selector: 'app-vibematch',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './vibematch.component.html',
  styleUrls: ['./vibematch.component.scss']
})
export class VibematchComponent {
  form: FormGroup;
  result: VibeMatchRes | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService      // ← inject your ApiService instead of HttpClient
  ) {
    this.form = this.fb.group({
      artists: this.fb.array(
        Array(5).fill('').map(() => this.fb.control('', { nonNullable: true }))
      )
    });
  }

  get artists(): FormArray {
    return this.form.get('artists') as FormArray;
  }
  
  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    const payload = { artists: this.artists.value as string[] };

    this.api.vibematch(payload).subscribe({
      next: res => {
        this.result = res;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
