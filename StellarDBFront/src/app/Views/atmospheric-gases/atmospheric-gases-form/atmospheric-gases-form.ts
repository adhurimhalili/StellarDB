import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { GlobalConfig } from '../../../global-config';
import { MatSelectModule } from '@Angular/material/select'


@Component({
  selector: 'app-atmospheric-gases-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule],
  templateUrl: './atmospheric-gases-form.html',
  styleUrl: './atmospheric-gases-form.css'
})
export class AtmosphericGasesForm {
  private readonly apiAction = `${GlobalConfig.apiUrl}/AtmosphericGases`;
  readonly title: string;
  atmosphericGasForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AtmosphericGasesForm>,
    @Inject(MAT_DIALOG_DATA) public data: { gasId: string }
  ) {
    this.atmosphericGasForm = this.formBuilder.group({
      id: data,
      molecularWeight: [null, [Validators.required, Validators.maxLength(10)]],
      formula: ['', [Validators.required, Validators.maxLength(20)]],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      density: [null, [Validators.required, Validators.maxLength(10)]],
      meltingPoint: [null, Validators.maxLength(10)],
      boilingPoint: [null, Validators.maxLength(10)],
      discoveryYear: null,
      description: ['', [Validators.maxLength(500)]]
    });
    this.title = data ? 'Modify Atmospheric Gas' : 'Add Atmospheric Gas';
  };

  ngAfterViewInit() {
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
  }

  loadFromData() {
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET' })
      .then(response => response.json())
      .then(formData => {
        this.atmosphericGasForm.patchValue(formData);
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
      body: JSON.stringify(this.atmosphericGasForm.value)
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
