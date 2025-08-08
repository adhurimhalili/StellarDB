import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@Angular/material/select'
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { GlobalConfig } from '../../../global-config';
import { PlanetType } from '../../planet-types/planet-types';
import { Star } from '../../star/star';

@Component({
  selector: 'app-planet-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatAutocompleteModule],
  templateUrl: './planet-form.html',
  styleUrl: './planet-form.css'
})
export class PlanetForm {
  private apiAction = `${GlobalConfig.apiUrl}/Planet`;
  planetForm: FormGroup;
  title: string;
  planetTypes: PlanetType[] = [];
  stars: Star[] = [];

  constructor(private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<PlanetForm>,
    @Inject(MAT_DIALOG_DATA) public data: { planetId: string }
  ) {
    this.planetForm = this.formBuilder.group({
      id: data,
      name: ['', [Validators.required, Validators.maxLength(50)]],
      starId: [null, Validators.required],
      planetTypeId: [null, Validators.required],
      mass: [null, Validators.required],
      diameter: [null, Validators.required],
      rotationPeriod: [null, Validators.required],
      orbitalPeriod: [null, Validators.required],
      orbitalEccentricity: [null, Validators.required, Validators.min(0), Validators.max(1)],
      orbitalInclination: [null, Validators.required],
      semiMajorAxis: [null, Validators.required],
      distanceFromStar: [null, Validators.required],
      surfaceTemperature: [null, Validators.required],
      discoveryDate: ['', Validators.required],
      description: ['', [Validators.maxLength(500)]]
      // composition: [''],
      // atmosphere: ['']
    });
    this.title = data ? 'Modify Planet' : 'Add Planet';
  }

  fetchStars() {
    fetch(`${GlobalConfig.apiUrl}/Star`, { method: 'GET' })
      .then(response => response.json())
      .then(data => this.stars = data)
      .catch(error => console.error('Error fetching stars:', error));
  }

  fetchPlanetTypes() {
    fetch(`${GlobalConfig.apiUrl}/PlanetTypes`, { method: 'GET' })
      .then(response => response.json())
      .then(data => this.planetTypes = data)
      .catch(error => console.error('Error fetching planet types:', error));
  }

  ngAfterViewInit() {
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
    this.fetchPlanetTypes();
    this.fetchStars();
  }

  loadFromData() {
    fetch(`${this.apiAction}/${this.data.planetId}`, { method: 'GET' })
      .then(response => response.json())
      .then(formData => {
        this.planetForm.patchValue(formData);
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
      body: JSON.stringify(this.planetForm.value)
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
