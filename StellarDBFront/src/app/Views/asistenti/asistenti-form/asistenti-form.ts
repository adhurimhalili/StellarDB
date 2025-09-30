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
import { Departament } from '../../departamenti/departamenti';

@Component({
  selector: 'app-asistenti-form',
  imports: [CommonModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './asistenti-form.html',
  styleUrl: './asistenti-form.css'
})
export class AsistentiForm {
  readonly title: string;
  asistentiForm: FormGroup; // Ndrysho variablen
  private readonly apiAction = `${GlobalConfig.apiUrl}/Asistenti`; // Ndrysho controllerin
  departamentet: Departament[] = [];

  constructor(private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AsistentiForm>,
    @Inject(MAT_DIALOG_DATA) public data: { asistentiId: string }) {
    this.asistentiForm = this.formBuilder.group({
      id: data,
      emri: '',
      mbiemri: '',
      pozita: '',
      id_Departamenti: null
    })
    this.title = data ? 'Modify Asistenti' : "Add Asistentiu"; // Ndrysho titullin
  }

  ngAfterViewInit() {
    this.fetchDepartamentet();
    if (this.data) {
      this.loadFromData();
    }
  }

  fetchDepartamentet() { // ndrysho sipas controllerin TJETER
    fetch(`${GlobalConfig.apiUrl}/Departamenti`, { method: 'GET' })
      .then(response => response.json())
      .then(data => this.departamentet = data)
      .catch(error => console.error('Error fetching stars:', error));
  }

  loadFromData() {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET' })
      .then(response => response.json())
      .then(formData => {
        // ndrysho variablen e formes
        this.asistentiForm.patchValue(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  onSubmit() {
    Object.keys(this.asistentiForm.controls).forEach(key => {
      const control = this.asistentiForm.get(key);
      control?.markAsTouched();
    });

    const httpMethod = this.data ? "PUT" : "POST";
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.asistentiForm.value) // ndrysho variablen e formes
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
