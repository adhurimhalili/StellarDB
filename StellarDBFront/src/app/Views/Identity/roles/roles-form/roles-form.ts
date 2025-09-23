import { Component, Inject, AfterViewInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, ValidationErrors } from '@angular/forms';
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
import { GlobalConfig } from '../../../../global-config';
import { AuthService } from '../../../../Services/Auth/auth.service';


@Component({
  selector: 'app-roles-form',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDialogModule, MatSelectModule, MatAutocompleteModule, MatSliderModule, MatExpansionModule, MatIconModule],
  templateUrl: './roles-form.html',
  styleUrl: './roles-form.css'
})
export class RolesForm implements AfterViewInit{
  readonly title: string;
  roleForm: FormGroup;
  roleClaims: { claimType: string; claimValue: string; }[] = [];

  private readonly apiAction = `${GlobalConfig.apiUrl}/Roles`;
  private authService = inject(AuthService);

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<RolesForm>,
    @Inject(MAT_DIALOG_DATA) public data: { roleId: string }
  ) {
    this.roleForm = this.formBuilder.group({
      id: data,
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(500)]],
      roleClaims: this.formBuilder.array([])
    });
    this.title = data ? 'Modify Role' : 'Add Role';
  }

  ngAfterViewInit() {
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
  }

  loadFromData() {
    const token = this.authService.getToken();
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
      .then(response => response.json())
      .then(formData => {
        this.roleClaimsArray.clear();
        this.roleForm.patchValue(formData);
        formData.roleClaims.forEach((c: { claimType: string; claimValue: string; }) => this.addRoleClaim(c.claimType, c.claimValue));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  get roleClaimsArray(): FormArray {
    return this.roleForm.get('roleClaims') as FormArray;
  }

  addRoleClaim(claimType?: string, claimValue?: string): void {
    const newGroup = this.formBuilder.group({
      claimType: [claimType ?? '', Validators.required],
      claimValue: [claimValue ?? '', Validators.required]
    });

    this.roleClaimsArray.push(newGroup);
    this.roleClaimsArray.updateValueAndValidity();
  }

  removeRoleClaim(index: number) {
    this.roleClaimsArray.removeAt(index);
  }

  onSubmit() {
    Object.keys(this.roleForm.controls).forEach(key => {
      const control = this.roleForm.get(key);
      control?.markAsTouched();
    });

    const httpMethod = this.data ? "PUT" : "POST";
    const token = this.authService.getToken();
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(this.roleForm.value)
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
