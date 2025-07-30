import {  AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { GlobalConfig } from '../../../global-config'; 

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
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
  }

  loadFromData() {
    fetch(`${GlobalConfig.apiUrl}/StellarObjectTypes/${this.data}`, { method: 'GET' })
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
      fetch(`${GlobalConfig.apiUrl}api/StellarObjectTypes`, {
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
