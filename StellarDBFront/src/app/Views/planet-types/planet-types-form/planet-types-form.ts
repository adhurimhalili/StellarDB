import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { GlobalConfig } from '../../../global-config';
import { AuthService } from '../../../Services/Auth/auth.service';

@Component({
  selector: 'app-planet-types-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule],
  templateUrl: './planet-types-form.html',
  styleUrl: './planet-types-form.css'
})
export class PlanetTypesForm {
  readonly title: string;
  private apiAction = `${GlobalConfig.apiUrl}/PlanetTypes`;
  planetTypesForm: FormGroup;
  private authService = inject(AuthService);

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<PlanetTypesForm>,
    @Inject(MAT_DIALOG_DATA) public data: { planetTypeId: string }
  ) {
    this.planetTypesForm = this.formBuilder.group({
      id: data,
      name: ['', [Validators.required, Validators.maxLength(50)]],
      code: ['', [Validators.required, Validators.maxLength(10)]],
      description: ['', [Validators.maxLength(200)]]
    });
    this.title = data ? 'Modify Planet Type' : 'Add Planet Type';
  }

  ngAfterViewInit() {
    const token = this.authService.getToken();
    if (this.data != null || this.data != undefined) {
      this.loadFromData(token!);
    }
  }

  loadFromData(token: string) {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
      .then(response => response.json())
      .then(formData => {
        this.planetTypesForm.patchValue(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  onSubmit() {
    Object.keys(this.planetTypesForm.controls).forEach(key => {
      const control = this.planetTypesForm.get(key);
      control?.markAsTouched();
    });

    const httpMethod = this.data ? 'PUT' : 'POST';
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.planetTypesForm.value)
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
