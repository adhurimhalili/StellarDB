import { Component, Inject, ChangeDetectionStrategy, signal, inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { GlobalConfig } from '../../../global-config';
// copy paste imports

// PER TE GJENERUAR COMPONENTIN E RI:
// cd ./StellarDBFront <- VETEM HEREN E PARE TE GJENERIMIT
// ng generate component Views/festivali/festivali-form --standalone

@Component({
  selector: 'app-festivali-form',
  // copy paste imports
  imports: [CommonModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './festivali-form.html',
  styleUrl: './festivali-form.css'
})
export class FestivaliForm {
  readonly title: string;
  festivaliForm: FormGroup; // Ndrysho variablen
  private readonly apiAction = `${GlobalConfig.apiUrl}/Festivali`; // Ndrysho controllerin

  constructor(private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<FestivaliForm>,
    @Inject(MAT_DIALOG_DATA) public data: { festivalidId: string }) {
    // Modifiko fushat sipas interface
    this.festivaliForm = this.formBuilder.group({
      id: data,
      emriFestivalit: '',
      llojiFestivalit: '',
    })
    this.title = data ? 'Modify Festivali' : "Add Festivali"; // Ndrysho titullin
  }

  ngAfterViewInit() {
    if (this.data) {
      this.loadFromData();
    }
  }

  loadFromData() {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET' })
      .then(response => response.json())
      .then(formData => {
        this.festivaliForm.patchValue(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  onSubmit() {
    Object.keys(this.festivaliForm.controls).forEach(key => {
      const control = this.festivaliForm.get(key);
      control?.markAsTouched();
    });

    const httpMethod = this.data ? "PUT" : "POST";
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.festivaliForm.value)
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
