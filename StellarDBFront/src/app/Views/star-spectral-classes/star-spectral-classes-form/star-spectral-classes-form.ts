import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { GlobalConfig } from '../../../global-config';

@Component({
  selector: 'app-star-spectral-classes-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './star-spectral-classes-form.html',
  styleUrl: './star-spectral-classes-form.css'
})
export class StarSpectralClassesForm implements AfterViewInit {
  starSpectralClassForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<StarSpectralClassesForm>,
    @Inject(MAT_DIALOG_DATA) public data: { starSpectralClassId: string }
  ) {
    this.starSpectralClassForm = this.formBuilder.group({
      id: data,
      code: ['', [Validators.required, Validators.maxLength(2)]],
      temperatureRange: ['', Validators.required],
      color: ['', Validators.required],
      description: ['', Validators.required]
    });
  }
  ngAfterViewInit(): void {
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
  }

  loadFromData() {
    fetch(`${GlobalConfig.apiUrl}/StarSpectralClasses/${this.data}`, { method: 'GET' })
      .then(response => response.json())
      .then(formData => {
        this.starSpectralClassForm?.patchValue(formData);
        console.log(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  onSubmit() {
    const httpMethod = this.data ? "PUT" : "POST";
    fetch(`${GlobalConfig.apiUrl}/StarSpectralClasses`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.starSpectralClassForm.value)
    })
      .then(response => response.json())
      .then(result => {
        this.dialogRef.close(result);
      })
      .catch(error => {
        console.error('Error saving data:', error);
      });
  }
}
