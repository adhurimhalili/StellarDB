import { Component, inject, Inject, ChangeDetectionStrategy, model } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { GlobalConfig } from '../../../global-config';
import { MatSelectModule } from '@angular/material/select';
import { Star } from '../../star/star';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../../../Services/Auth/auth.service';


@Component({
  selector: 'app-constellations-form',
  imports: [CommonModule, ReactiveFormsModule,
    MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatIconModule, MatAutocompleteModule,
    MatDatepickerModule, MatCheckboxModule, MatChipsModule],
  templateUrl: './constellations-form.html',
  styleUrl: './constellations-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstellationsForm {
  readonly title: string;
  readonly separatorKeyCodes: number[] = [ENTER, COMMA];
  readonly currentStar = model('');
  readonly announcer = inject(LiveAnnouncer);
  allStars: Star[] = [];
  filteredStars: Star[] = [];
  selectedStars: Star[] = [];
  constellationForm: FormGroup;
  private readonly apiAction = `${GlobalConfig.apiUrl}/Constellations`;
  private authService = inject(AuthService);
  private readonly token = this.authService.getToken();
  private correlationId: string = uuidv4();

  constructor(private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ConstellationsForm>,
    @Inject(MAT_DIALOG_DATA) public data: { constellationId: string }
  ) {
    this.constellationForm = this.formBuilder.group({
      id: data,
      name: ['', [Validators.required]],
      starIds: [[]],
      description: ['']
    });
    this.title = data ? 'Modify Constellation' : 'Add Constellation';
    this.filteredStars = [];
  }

  ngAfterViewInit() {
    this.fetchStars(this.token!);
    if (this.data != null || this.data != undefined) {
      this.loadFromData(this.token!);
    }
  }

  loadFromData(token: string) {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
      .then(response => response.json())
      .then(formData => {
        this.constellationForm.patchValue(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  fetchStars(token: string) {
    fetch(`${GlobalConfig.apiUrl}/Star`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
      .then(response => response.json())
      .then((data: Star[]) => {
        this.allStars = data;
        this.filteredStars = this.allStars.slice();
        const starIds = this.constellationForm.get('starIds')?.value as string[];
        if (starIds && starIds.length > 0) {
          this.selectedStars = this.allStars.filter(r => starIds.includes(r.id));
        }
      })
      .catch(error => console.error('Error fetching stars:', error));
  }

  filterStars(value: string) {
    const filterValue = value?.toLowerCase() || '';
    this.filteredStars = this.allStars.filter(star =>
      star.name.toLowerCase().includes(filterValue) &&
      !this.selectedStars.some(selected => selected.id === star.id)
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const found = this.allStars.find(star => star.name.toLowerCase() === value.toLowerCase());
      if (found && !this.selectedStars.some(r => r.id === found.id)) {
        this.selectedStars.push(found);
        this.constellationForm.get('starIds')?.setValue(this.selectedStars.map(r => r.id));
      }
    }
    event.chipInput!.clear();
    this.currentStar.set('');
    this.filterStars('');
  }

  remove(star: Star): void {
    const index = this.selectedStars.findIndex(r => r.id === star.id);
    if (index >= 0) {
      this.selectedStars.splice(index, 1);
      this.constellationForm.get('starIds')?.setValue(this.selectedStars.map(r => r.id));
      this.announcer.announce(`Removed ${star.name}`);
      this.filterStars(this.currentStar());
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const star = this.allStars.find(r => r.id === event.option.value);
    if (star && !this.selectedStars.some(r => r.id === star.id)) {
      this.selectedStars.push(star);
      this.constellationForm.get('starIds')?.setValue(this.selectedStars.map(r => r.id));
    }
    this.currentStar.set('');
    this.filterStars('');
  }

  onStarInputChange(value: string) {
    this.currentStar.set(value);
    this.filterStars(value);
  }

  onSubmit() {
    Object.keys(this.constellationForm.controls).forEach(key => {
      const control = this.constellationForm.get(key);
      control?.markAsTouched();
    });

    this.constellationForm.get('starIds')?.setValue(this.selectedStars.map(s => s.id));

    const httpMethod = this.data ? "PUT" : "POST";
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}`, 'X-Correlation-ID': this.correlationId, },
      body: JSON.stringify(this.constellationForm.value)
    })
      .then(async response => {
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.message || `Server returned ${response.status}`;
          throw new Error(errorMessage);
        }
        return response.json();
      })
      .then(result => {
        this.dialogRef.close(result);
      })
      .catch(error => {
        console.error('Error submitting form:', error);
      });
  }

}
