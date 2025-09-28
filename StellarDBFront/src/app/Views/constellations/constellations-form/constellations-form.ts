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
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
  }

  loadFromData() {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET' })
      .then(response => response.json())
      .then(formData => {
        this.constellationForm.patchValue(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  fetchStars() {
    fetch(`${GlobalConfig.apiUrl}/Stars`, { method: 'GET' })
      .then(response => response.json())
      .then((data: Star[]) => {
        this.allStars = data;
        this.filteredStars = this.allStars.slice();
        const starIds = this.constellationForm.get('stars')?.value as string[];
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
        this.constellationForm.get('roles')?.setValue(this.selectedStars.map(r => r.id));
      }
    }
    event.chipInput!.clear();
    this.currentStar.set('');
    this.filterStars('');
  }

  remove(role: Star): void {
    const index = this.selectedStars.findIndex(r => r.id === role.id);
    if (index >= 0) {
      this.selectedStars.splice(index, 1);
      this.constellationForm.get('roles')?.setValue(this.selectedStars.map(r => r.id));
      this.announcer.announce(`Removed ${role.name}`);
      this.filterStars(this.currentStar());
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const role = this.allStars.find(r => r.id === event.option.value);
    if (role && !this.selectedStars.some(r => r.id === role.id)) {
      this.selectedStars.push(role);
      this.constellationForm.get('roles')?.setValue(this.selectedStars.map(r => r.id));
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

    const httpMethod = this.data ? "PUT" : "POST";
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json' },
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
