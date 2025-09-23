import { AfterViewInit, Component, inject, Inject } from '@angular/core';
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
import { AuthService } from '../../../Services/Auth/auth.service';
import { v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-star-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatExpansionModule, MatSliderModule, MatIconModule],
  templateUrl: './star-form.html',
  styleUrl: './star-form.css'
})
export class StarForm {
  readonly title: string;
  starForm: FormGroup;
  starSpectralClasses: StarSpectralClasses[] = [];
  starLuminosityClasses: StarLuminosityClasses[] = [];
  chemicalElements: ChemicalElement[] = [];

  private readonly apiAction = `${GlobalConfig.apiUrl}/Star`;
  private authService = inject(AuthService);
  private readonly token = this.authService.getToken();
  private correlationId: string = uuidv4();

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<StarForm>,
    @Inject(MAT_DIALOG_DATA) public data: { starId: string }
  ) {
    window.sessionStorage.setItem('correlationId', this.correlationId);
    this.starForm = this.formBuilder.group({
      id: data,
      name: ['', [Validators.required, Validators.maxLength(50)]],
      spectralClassId: [null, Validators.required],
      luminosityClassId: [null, Validators.required],
      magnitude: [null, [Validators.required, Validators.min(0)]],
      distance: [null, [Validators.required, Validators.min(0)]],
      diameter: [null, [Validators.required, Validators.min(0)]],
      mass: [null, [Validators.required, Validators.min(0)]],
      temperature: [null, [Validators.required, Validators.min(0)]],
      discoveryDate: ['', Validators.required],
      composition: this.formBuilder.array([]),
      description: ['', [Validators.maxLength(500)]]
    });
    this.title = data ? 'Modify Star' : 'Add Star';
  }

  fetchSpectralClasses(token: string) {
    fetch(`${GlobalConfig.apiUrl}/StarSpectralClasses`, { method: 'GET', headers: { 'Authorization': `Bearer ${this.token}`, 'X-Correlation-ID': this.correlationId, } })
      .then(response => response.json())
      .then(data => this.starSpectralClasses = data);
  }

  fetchLuminosityClasses(token: string) {
    fetch(`${GlobalConfig.apiUrl}/StarLuminosityClasses`, { method: 'GET', headers: { 'Authorization': `Bearer ${this.token}`, 'X-Correlation-ID': this.correlationId, } })
      .then(response => response.json())
      .then(data => this.starLuminosityClasses = data);
  }

  fetchChemicalElements(token: string) {
    fetch(`${GlobalConfig.apiUrl}/ChemicalElements`, { method: 'GET', headers: { 'Authorization': `Bearer ${this.token}`, 'X-Correlation-ID': this.correlationId, } })
      .then(response => response.json())
      .then(data => this.chemicalElements = data)
      .catch(error => console.error('Error fetching chemical elements:', error));
  }

  ngAfterViewInit() {
    const token = this.authService.getToken();
    if (this.data != null || this.data != undefined) {
      this.loadFromData(token!);
    }
    this.fetchSpectralClasses(token!);
    this.fetchLuminosityClasses(token!);
    this.fetchChemicalElements(token!);
  }

  loadFromData(token: string) {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET', headers: { 'Authorization': `Bearer ${this.token}`, 'X-Correlation-ID': this.correlationId, } })
      .then(response => response.json())
      .then(formData => {
        this.compositionArray.clear();
        this.starForm?.patchValue(formData);
        formData.composition.forEach((c: { id: string; percentage: number }) => this.addComposition(c.id, c.percentage));
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
    Object.keys(this.starForm.controls).forEach(key => {
      const control = this.starForm.get(key);
      control?.markAsTouched();
    });

    const httpMethod = this.data ? "PUT" : "POST";
    const token = this.authService.getToken();
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Correlation-ID': this.correlationId },
      body: JSON.stringify(this.starForm.value)
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
