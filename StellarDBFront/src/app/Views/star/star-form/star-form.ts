import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { GlobalConfig } from '../../../global-config';
import { MatSelectModule } from '@angular/material/select'
import { StarSpectralClasses } from '../../star-spectral-classes/star-spectral-classes';
import { StarLuminosityClasses } from '../../star-luminosity-classes/star-luminosity-classes';
import { ChemicalElement } from '../../chemical-elements/chemical-elements';


@Component({
  selector: 'app-star-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatExpansionModule, MatSliderModule, MatIconModule],
  templateUrl: './star-form.html',
  styleUrl: './star-form.css'
})
export class StarForm {
  private apiAction = `${GlobalConfig.apiUrl}/Star`;
  starForm: FormGroup;
  starSpectralClasses: StarSpectralClasses[] = [];
  starLuminosityClasses: StarLuminosityClasses[] = [];
  chemicalElements: ChemicalElement[] = [];

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
      discoveryDate: ['', Validators.required],
      composition: this.formBuilder.array([]),
      description: ['', [Validators.maxLength(500)]]
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

  fetchChemicalElements() {
    fetch(`${GlobalConfig.apiUrl}/ChemicalElements`, { method: 'GET' })
      .then(response => response.json())
      .then(data => this.chemicalElements = data)
      .catch(error => console.error('Error fetching chemical elements:', error));
  }

  ngAfterViewInit() {
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
    this.fetchSpectralClasses();
    this.fetchLuminosityClasses();
    this.fetchChemicalElements();
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

  get compositionArray(): FormArray {
    return this.starForm.get('composition') as FormArray;
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
    const formArray = this.starForm.get(arrayName) as FormArray;
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
