import { Component, Inject } from '@angular/core';
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
import { Festival } from '../../festivali/festivali'; // ndrysho importin per combon
// copy paste imports


@Component({
  selector: 'app-eventi-form',
  // copy paste imports
  imports: [CommonModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './eventi-form.html',
  styleUrl: './eventi-form.css'
})
export class EventiForm {
  readonly title: string;
  eventiForm: FormGroup; // Ndrysho variablen
  private readonly apiAction = `${GlobalConfig.apiUrl}/Eventi`; // Ndrysho controllerin
  festivalet: Festival[] = [];

  constructor(private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EventiForm>,
    @Inject(MAT_DIALOG_DATA) public data: { eventiId: string }) {
    // Modifiko fushat sipas interface
    this.eventiForm = this.formBuilder.group({
      id: data,
      emriEventit: '',
      orari: '',
      id_Festivali: null
    })
    this.title = data ? 'Modify Festivali' : "Add Festivali"; // Ndrysho titullin
  }

  ngAfterViewInit() {
    this.fetchFestivalet();
    if (this.data) {
      this.loadFromData();
    }
  }

  fetchFestivalet() {
    fetch(`${GlobalConfig.apiUrl}/Festivali`, { method: 'GET' })
      .then(response => response.json())
      .then(data => this.festivalet = data)
      .catch(error => console.error('Error fetching stars:', error));
  }


  loadFromData() {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET' })
      .then(response => response.json())
      .then(formData => {
        this.eventiForm.patchValue(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  onSubmit() {
    Object.keys(this.eventiForm.controls).forEach(key => {
      const control = this.eventiForm.get(key);
      control?.markAsTouched();
    });

    const httpMethod = this.data ? "PUT" : "POST";
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.eventiForm.value)
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
