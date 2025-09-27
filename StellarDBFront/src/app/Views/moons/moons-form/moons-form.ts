import { Component, Inject, ChangeDetectionStrategy, signal, inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
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
import { Planet } from '../../planet/planet'
import { ChemicalElement } from '../../chemical-elements/chemical-elements';
import { AtmosphericGas } from '../../atmospheric-gases/atmospheric-gases';
import { AuthService } from '../../../Services/Auth/auth.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-moons-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatAutocompleteModule, MatSliderModule, MatExpansionModule, MatIconModule],
  templateUrl: './moons-form.html',
  styleUrl: './moons-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoonsForm {
  readonly title: string;
  moonForm: FormGroup;
  planets: Planet[] = [];
  chemicalElements: ChemicalElement[] = [];
  composition: { id: string; percentage: number; }[] = [];

  private readonly apiAction = `${GlobalConfig.apiUrl}/Moons`;
  readonly compositionPanelState = signal(false);
  private authService = inject(AuthService);
  private correlationId: string = uuidv4();

  constructor(private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<MoonsForm>,
    @Inject(MAT_DIALOG_DATA) public data: { moonId: string }) {
    this.moonForm = this.formBuilder.group({
      id: data,
      name: ['', [Validators.required, Validators.maxLength(50)]],
      planetId: [null, Validators.required],
      mass: [null, [Validators.required, Validators.min(0)]],
      diameter: [null, [Validators.required, Validators.min(0)]],
      rotationPeriod: [null, [Validators.required, Validators.min(0)]],
      orbitalPeriod: [null, [Validators.required, Validators.min(0)]],
      orbitalEccentricity: [null, [Validators.required, Validators.min(0), Validators.max(1)]],
      orbitalInclination: [null, [Validators.required, Validators.min(0), Validators.max(360)]],
      semiMajorAxis: [null, [Validators.required, Validators.min(0)]],
      distanceFromPlanet: [null, [Validators.required, Validators.min(0)]],
      surfaceTemperature: [null, [Validators.required, Validators.min(0)]],
      discoveryDate: ['', Validators.required],
      description: ['', [Validators.maxLength(500)]],
      composition: this.formBuilder.array([]),
    })
    this.title = data ? 'Modify Moon' : "Add Moon";
    window.sessionStorage.setItem("correlationId", this.correlationId);
  }

  fetchPlanets(token: string) {
    fetch(`${GlobalConfig.apiUrl}/Planet`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'X-Correlation-ID': this.correlationId, } })
      .then(response => response.json())
      .then(data => this.planets = data)
      .catch(error => console.error('Error fetching stars:', error));
  }

  fetchChemicalElements(token: string) {
    fetch(`${GlobalConfig.apiUrl}/ChemicalElements`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'X-Correlation-ID': this.correlationId, } })
      .then(response => response.json())
      .then(data => this.chemicalElements = data)
      .catch(error => console.error('Error fetching chemical elements:', error));
  }

  ngAfterViewInit() {
    const token = this.authService.getToken();
    if (this.data != null || this.data != undefined) {
      this.loadFromData(token!);
    }
    this.fetchPlanets(token!);
    this.fetchChemicalElements(token!);
  }

  loadFromData(token: string) {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'X-Correlation-ID': this.correlationId, } })
      .then(response => response.json())
      .then(formData => {
        this.compositionArray.clear();
        this.moonForm.patchValue(formData);
        formData.composition.forEach((c: { id: string; percentage: number }) => this.addComposition(c.id, c.percentage));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  get compositionArray(): FormArray {
    return this.moonForm.get('composition') as FormArray;
  }

  addComposition(id?: string, percentage?: number): void {
    const newGroup = this.formBuilder.group({
      id: [id ?? ''],
      percentage: [percentage ?? 0, [
        Validators.min(0),
        Validators.max(100),
        Validators.required
      ]]
    });

    // Get current total
    const currentTotal = this.getTotalPercentage('composition');
    const remainingAllowed = 100 - currentTotal;

    // If adding would exceed 100%, cap at remaining allowed
    if (percentage && percentage > remainingAllowed) {
      newGroup.patchValue({ percentage: remainingAllowed });
    }

    this.compositionArray.push(newGroup);
    //this.compositionArray.setValidators(this.validateTotalPercentage('composition'));
    this.compositionArray.updateValueAndValidity();
  }

  removeComposition(index: number) {
    this.compositionArray.removeAt(index);
  }

  getTotalPercentage(arrayName: string): number {
    const formArray = this.moonForm.get(arrayName) as FormArray;
    if (!formArray) return 0;

    return formArray.controls
      .reduce((sum, control) => {
        const percentage = control.get('percentage')?.value || 0;
        return sum + Number(percentage);
      }, 0);
  }

  getRemainingPercentage(arrayName: string): number {
    return Math.max(0, 100 - this.getTotalPercentage(arrayName));
  }

  onSubmit() {
    Object.keys(this.moonForm.controls).forEach(key => {
      const control = this.moonForm.get(key);
      control?.markAsTouched();
    });

    const httpMethod = this.data ? "PUT" : "POST";
    const token = this.authService.getToken();
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Correlation-ID': this.correlationId, },
      body: JSON.stringify(this.moonForm.value)
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
