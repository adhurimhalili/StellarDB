import {  AfterViewInit, Component, inject, Inject } from '@angular/core';
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
  selector: 'app-stellar-object-types-form',
  templateUrl: './stellar-object-types-form.html',
  styleUrl: './stellar-object-types-form.css',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule
  ],
})
export class StellarObjectTypesForm implements AfterViewInit {
  stellarBodyForm: FormGroup;
  apiAction = `${GlobalConfig.apiUrl}/StellarObjectTypes`;
  private authService = inject(AuthService);
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<StellarObjectTypesForm>,
    @Inject(MAT_DIALOG_DATA) public data: { stellarObjectId: string }
  ) {
    this.stellarBodyForm = this.formBuilder.group({
      id: data,
      name: ['', Validators.required],
      description: ['', Validators.required]
    })
  }
  ngAfterViewInit(): void {
    const token = this.authService.getToken();
    if (this.data != null || this.data != undefined) {
      this.loadFromData(token!);
    }
  }

  loadFromData(token: string) {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
      .then(response => response.json())
      .then(formData => {
        this.stellarBodyForm?.patchValue(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error)
      })
  }

  onSubmit() {
    var httpMethod = this?.data ? "PUT" : "POST";
    if (this.stellarBodyForm?.valid) {
      fetch(`${this.apiAction}`, {
        method: httpMethod,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.stellarBodyForm.value)
      })
        .then(response => response.json())
        .then(result => {
          console.log('Form submitted successfully:', result);
          this.dialogRef.close(true); // Close dialog and indicate success
        })
        .catch(error => {
          console.error('Error submitting form:', error);
        });
      }
    }
  }
