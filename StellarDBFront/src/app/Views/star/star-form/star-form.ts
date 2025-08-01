import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { GlobalConfig } from '../../../global-config';
import { MatSelectModule } from '@Angular/material/select'
import { StarSpectralClasses } from '../../star-spectral-classes/star-spectral-classes';
import { StarLuminosityClasses } from '../../star-luminosity-classes/star-luminosity-classes';


@Component({
  selector: 'app-star-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule],
  templateUrl: './star-form.html',
  styleUrl: './star-form.css'
})
export class StarForm {
  private apiAction = `${GlobalConfig.apiUrl}/Star`;
  starForm: FormGroup;
  starSpectralClasses: StarSpectralClasses[] = [];
  starLuminosityClasses: StarLuminosityClasses[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<StarForm>,
    @Inject(MAT_DIALOG_DATA) public data: { starId: string }
  ) {
    this.starForm = this.formBuilder.group({
      id: data,
      name: ['', [Validators.required, Validators.maxLength(50)]],
      spectralClassId: [null, Validators.required],
      luminosityClassId: [null, Validators.required],
      magnitude: [null, Validators.required],
      distance: [null, Validators.required],
      diameter: [null, Validators.required],
      mass: [null, Validators.required],
      temperature: [null, Validators.required],
      discoveryDate: ['', Validators.required]
    });
  }

  fetchSpectralClasses() {
    fetch(`${GlobalConfig.apiUrl}/StarSpectralClasses`, { method: 'GET' })
      .then(response => response.json())
      .then(data => this.starSpectralClasses = data);
  }

  fetchLuminosityClasses() {
    fetch(`${GlobalConfig.apiUrl}/StarLuminosityClasses`, { method: 'GET' })
      .then(response => response.json())
      .then(data => this.starLuminosityClasses = data);
  }

  ngAfterViewInit() {
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
    this.fetchSpectralClasses();
    this.fetchLuminosityClasses();
  }

  loadFromData() {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET' })
      .then(response => response.json())
      .then(formData => {
        this.starForm?.patchValue(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  onSubmit() {
    const httpMethod = this.data ? "PUT" : "POST";
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.starForm.value)
    })
      .then(response => response.json())
      .then(result => {
        this.dialogRef.close(result);
      })
      .catch(error => {
        console.error('Error submitting form:', error);
      });
  }
}
