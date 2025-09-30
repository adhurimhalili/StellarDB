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

@Component({
  selector: 'app-departamenti-form',
  imports: [CommonModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './departamenti-form.html',
  styleUrl: './departamenti-form.css'
})
export class DepartamentiForm {
  readonly title: string;
  departamentiForm: FormGroup; // Ndrysho variablen
  private readonly apiAction = `${GlobalConfig.apiUrl}/Departamenti`; // Ndrysho controllerin

  constructor(private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<DepartamentiForm>,
    @Inject(MAT_DIALOG_DATA) public data: { departamentiId: string }) {
    this.departamentiForm = this.formBuilder.group({
      id: data,
      emriDepartamentit: '',
      numriZyrave: 0,
    })
    this.title = data ? 'Modify Departamenti' : "Add Departamenti"; 
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
        this.departamentiForm.patchValue(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  onSubmit() {
    Object.keys(this.departamentiForm.controls).forEach(key => {
      const control = this.departamentiForm.get(key);
      control?.markAsTouched();
    });

    const httpMethod = this.data ? "PUT" : "POST";
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.departamentiForm.value)
    })
      .then(async response => {
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.message || `Server returned ${response.status}`;
          throw new Error(errorMessage);
        }
        if (response.status === 204) {
          return null; // or handle as needed
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
