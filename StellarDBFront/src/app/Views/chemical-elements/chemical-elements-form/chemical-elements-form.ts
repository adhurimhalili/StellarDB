import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { GlobalConfig } from '../../../global-config';
import { MatSelectModule } from '@angular/material/select'

@Component({
  selector: 'app-chemical-elements-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule],
  templateUrl: './chemical-elements-form.html',
  styleUrl: './chemical-elements-form.css'
})
export class ChemicalElementsForm {
  private readonly apiAction = `${GlobalConfig.apiUrl}/ChemicalElements`;
  readonly title: string;
  chemicalElementForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ChemicalElementsForm>,
    @Inject(MAT_DIALOG_DATA) public data: { elementId: string }
  ) {
    this.chemicalElementForm = this.formBuilder.group({
      id: data,
      atomicNumber: [null, [Validators.required, Validators.maxLength(2)]],
      atomicWeight: [null, [Validators.required, Validators.maxLength(10)]],
      symbol: ['', [Validators.required, Validators.maxLength(3)]],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      meltingPoint: [null,Validators.maxLength(10)],
      boilingPoint: [null, Validators.maxLength(10)],
      period: [null, [Validators.required, Validators.maxLength(2)]],
      group: [null, [Validators.required, Validators.maxLength(2)]],
      discoveryYear: null,
      description: ['', [Validators.maxLength(500)]]
    });
    this.title = data ? 'Modify Chemical Element' : 'Add Chemical Element';
  }

  ngAfterViewInit() {
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
  }

  loadFromData() {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET' })
      .then(response => response.json())
      .then(formData => {
        this.chemicalElementForm.patchValue(formData);
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
      body: JSON.stringify(this.chemicalElementForm.value)
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
