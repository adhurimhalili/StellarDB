import { Component, Inject, AfterViewInit, inject, ChangeDetectionStrategy, computed, model, signal } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { GlobalConfig } from '../../../../global-config';
import { AuthService } from '../../../../Services/Auth/auth.service';
import { Role } from '../../roles/roles';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-users-form',
  imports: [CommonModule, ReactiveFormsModule,
    MatInputModule, MatFormFieldModule, MatButtonModule, MatButtonModule, MatDialogModule, MatSelectModule, MatIconModule, MatAutocompleteModule, MatChipsModule, MatDatepickerModule, MatCheckboxModule],
  templateUrl: './users-form.html',
  styleUrl: './users-form.css',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersForm implements AfterViewInit {
  readonly title: string;
  readonly separatorKeyCodes: number[] = [ENTER, COMMA];
  readonly currentRole = model('');
  allRoles: Role[] = [];
  filteredRoles: Role[] = [];
  selectedRoles: Role[] = [];
  readonly announcer = inject(LiveAnnouncer);

  userForm: FormGroup;

  private readonly apiAction = `${GlobalConfig.apiUrl}/User`;
  private authService = inject(AuthService);

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UsersForm>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string }
  ) {
    this.userForm = this.formBuilder.group({
      id: data,
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      userName: ['', [Validators.required, Validators.maxLength(50)]],
      firstName: ['', [Validators.maxLength(50)]],
      lastName: ['', [Validators.maxLength(50)]],
      dateOfBirth: [null],
      phoneNumber: ['', [Validators.maxLength(15)]],
      roles: [[]],
      active: [true]
    });
    this.title = data ? 'Modify Role' : 'Add Role';
    this.filteredRoles = [];
  }

  ngAfterViewInit() {
    const token = this.authService.getToken();
    this.fetchRoles(token!);
    if (this.data != null || this.data != undefined) {
      this.loadFromData();
    }
  }

  loadFromData() {
    const token = this.authService.getToken();
    fetch(`${this.apiAction}/${this.data}`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
      .then(response => response.json())
      .then(formData => {
        // Parse dateOfBirth from "dd/MM/yyyy" to Date object
        if (formData.dateOfBirth) {
          const [day, month, year] = formData.dateOfBirth.split('/');
          formData.dateOfBirth = new Date(+year, +month - 1, +day);
        }

        this.userForm.patchValue(formData);

        if (formData.roles) {
          this.userForm.get('roles')?.setValue(formData.roles);
          this.selectedRoles = this.allRoles.filter(r => formData.roles.includes(r.id));
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

  fetchRoles(token: string) {
    fetch(`${GlobalConfig.apiUrl}/Roles`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
      .then(response => response.json())
      .then((data: Role[]) => {
        this.allRoles = data;
        this.filteredRoles = this.allRoles.slice();
        const roleIds = this.userForm.get('roles')?.value as string[];
        if (roleIds && roleIds.length > 0) {
          this.selectedRoles = this.allRoles.filter(r => roleIds.includes(r.id));
        }
      })
      .catch(error => console.error('Error fetching roles:', error));
  }

  filterRoles(value: string) {
    const filterValue = value?.toLowerCase() || '';
    this.filteredRoles = this.allRoles.filter(role =>
      role.name.toLowerCase().includes(filterValue) &&
      !this.selectedRoles.some(selected => selected.id === role.id)
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const found = this.allRoles.find(role => role.name.toLowerCase() === value.toLowerCase());
      if (found && !this.selectedRoles.some(r => r.id === found.id)) {
        this.selectedRoles.push(found);
        this.userForm.get('roles')?.setValue(this.selectedRoles.map(r => r.id));
      }
    }
    event.chipInput!.clear();
    this.currentRole.set('');
    this.filterRoles('');
  }

  remove(role: Role): void {
    const index = this.selectedRoles.findIndex(r => r.id === role.id);
    if (index >= 0) {
      this.selectedRoles.splice(index, 1);
      this.userForm.get('roles')?.setValue(this.selectedRoles.map(r => r.id));
      this.announcer.announce(`Removed ${role.name}`);
      this.filterRoles(this.currentRole());
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const role = this.allRoles.find(r => r.id === event.option.value);
    if (role && !this.selectedRoles.some(r => r.id === role.id)) {
      this.selectedRoles.push(role);
      this.userForm.get('roles')?.setValue(this.selectedRoles.map(r => r.id));
    }
    this.currentRole.set('');
    this.filterRoles('');
  }

  onRoleInputChange(value: string) {
    this.currentRole.set(value);
    this.filterRoles(value);
  }

  onSubmit() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });

    this.userForm.get('roles')?.setValue(this.selectedRoles.map(r => r.id));

    const httpMethod = this.data ? "PUT" : "POST";
    const token = this.authService.getToken();
    fetch(`${this.apiAction}`, {
      method: httpMethod,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(this.userForm.value)
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
