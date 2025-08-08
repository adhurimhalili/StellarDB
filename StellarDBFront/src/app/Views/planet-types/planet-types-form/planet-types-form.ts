import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { GlobalConfig } from '../../../global-config';

@Component({
  selector: 'app-planet-types-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule],
  templateUrl: './planet-types-form.html',
  styleUrl: './planet-types-form.css'
})
export class PlanetTypesForm {
  private apiAction = `${GlobalConfig.apiUrl}/PlanetTypes`;
  planetTypesForm: FormGroup;
  title: string;

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
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
  }

  loadFromData() {
    fetch(`${this.apiAction}/${this.data.planetTypeId}`, { method: 'GET' })
      .then(response => response.json())
      .then(formData => {
        this.planetTypesForm.patchValue(formData);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  onSubmit() {
    const httpMethod = this.data.planetTypeId ? 'PUT' : 'POST';
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.planetTypesForm.value)
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
