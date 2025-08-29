import { Component, Inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { GlobalConfig } from '../../../global-config';
import { PlanetType } from '../../planet-types/planet-types';
import { Star } from '../../star/star';
import { ChemicalElement } from '../../chemical-elements/chemical-elements';
import { AtmosphericGas } from '../../atmospheric-gases/atmospheric-gases';

@Component({
  selector: 'app-planet-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatAutocompleteModule, MatSliderModule, MatExpansionModule, MatIconModule],
  templateUrl: './planet-form.html',
  styleUrl: './planet-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetForm {
  private apiAction = `${GlobalConfig.apiUrl}/Planet`;
  planetForm: FormGroup;
  title: string;
  planetTypes: PlanetType[] = [];
  chemicalElements: ChemicalElement[] = [];
  atmosphericGases: AtmosphericGas[] = [];
  atmosphere: { id: string; percentage: number }[] = [];
  composition: { id: string; percentage: number }[] = [];
  stars: Star[] = [];
  readonly compositionPanelState = signal(false);

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
      orbitalEccentricity: [null, [Validators.required, Validators.min(0), Validators.max(1)]],
      orbitalInclination: [null, Validators.required],
      semiMajorAxis: [null, Validators.required],
      distanceFromStar: [null, Validators.required],
      surfaceTemperature: [null, Validators.required],
      discoveryDate: ['', Validators.required],
      description: ['', [Validators.maxLength(500)]],
      composition: this.formBuilder.array([]),
      atmosphere: this.formBuilder.array([])
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

  fetchChemicalElements() {
    fetch(`${GlobalConfig.apiUrl}/ChemicalElements`, { method: 'GET' })
      .then(response => response.json())
      .then(data => this.chemicalElements = data)
      .catch(error => console.error('Error fetching chemical elements:', error));
  }

  fetchAtmosphericGases() {
    fetch(`${GlobalConfig.apiUrl}/AtmosphericGases`, { method: 'GET' })
      .then(response => response.json())
      .then(data => this.atmosphericGases = data)
      .catch(error => console.error('Error fetching atmospheric gases:', error));
  }

  ngAfterViewInit() {
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
    this.fetchPlanetTypes();
    this.fetchStars();
    this.fetchChemicalElements();
    this.fetchAtmosphericGases();
  }

  loadFromData() {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET' })
      .then(response => response.json())
      .then(formData => {
        this.compositionArray.clear();
        this.planetForm.patchValue(formData);
        formData.composition.forEach((c: { id: string; percentage: number }) => this.addComposition(c.id, c.percentage));
        formData.atmosphere.forEach((a: { id: string; percentage: number }) => this.addGas(a.id, a.percentage));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  get compositionArray(): FormArray {
    return this.planetForm.get('composition') as FormArray;
  }

  get atmosphereArray(): FormArray {
    return this.planetForm.get('atmosphere') as FormArray;
  }

  addComposition(id?: string, percentage?: number): void {
    this.compositionArray.push(
      this.formBuilder.group({
        id: id != null ? id : [''],
        percentage: percentage != null ? percentage : [0]
      })
    );
  }

  addGas(id?: string, percentage?: number): void {
    this.atmosphereArray.push(
      this.formBuilder.group({
        id: id != null ? id : [''],
        percentage: percentage != null ? percentage : [0]
      })
    );
  }

  removeComposition(index: number) {
    this.compositionArray.removeAt(index);
  }

  removeGas(index: number) {
    this.atmosphereArray.removeAt(index);
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
