import { AfterViewInit, Component, inject, Inject } from '@angular/core';
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
  selector: 'app-star-luminosity-classes-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule],
  templateUrl: './star-luminosity-classes-form.html',
  styleUrl: './star-luminosity-classes-form.css'
})
export class StarLuminosityClassesForm {
  readonly title: string;
  starLuminosityClassForm: FormGroup;
  private readonly apiAction = `${GlobalConfig.apiUrl}/StarLuminosityClasses`;
  private authService = inject(AuthService);
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<StarLuminosityClassesForm>,
    @Inject(MAT_DIALOG_DATA) public data: { starLuminosityClassId: string }
  ) {
    this.starLuminosityClassForm = this.formBuilder.group({
      id: data,
      code: ['', [Validators.required, Validators.maxLength(4)]],
      name: ['', Validators.required],
      description: ['']
    });
    this.title = data ? 'Modify Luminosity Class' : 'Add  Luminosity Class';
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
        this.starLuminosityClassForm?.patchValue(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  onSubmit() {
    Object.keys(this.starLuminosityClassForm.controls).forEach(key => {
      const control = this.starLuminosityClassForm.get(key);
      control?.markAsTouched();
    });

    const httpMethod = this.data ? "PUT" : "POST";
    const token = this.authService.getToken();
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(this.starLuminosityClassForm.value)
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
