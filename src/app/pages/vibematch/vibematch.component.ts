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
import { SpotifyService, Artist } from '../../services/spotify-search.service';
import { Observable, of }                   from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
@Component({
  selector: 'app-vibematch',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
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

  artistOptions: Observable<Artist[]>[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,      // ← inject your ApiService instead of HttpClient
    private spotify: SpotifyService
  ) {
    this.form = this.fb.group({
      artists: this.fb.array(
        Array(5).fill('').map(() => this.fb.control('', { nonNullable: true }))
      )
    });

    this.artistOptions = Array(5).fill(of([]));

    this.artists.controls.forEach((ctrl, i) => {
      this.artistOptions[i] = ctrl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(name => name.length
          ? this.spotify.searchArtists(name) : of([])
        )
      );
    });
  }

  get artists(): FormArray {
    return this.form.get('artists') as FormArray;
  }
  onArtistSelected(index: number, artist: Artist) {
    // set the formControl to the artist name (or store the full object elsewhere)
    this.artists.at(index).setValue(artist);
  }
  displayArtistName(artist: Artist | null): string {
    return artist?.name ?? '';
  }
  
  submit() {
    if (this.form.invalid) return;

    this.loading = true;
   
    const artistObjs = this.artists.value as Artist[];
    const artistNames = artistObjs.map(a => a.name);
    const payload = { artists: artistNames };

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
