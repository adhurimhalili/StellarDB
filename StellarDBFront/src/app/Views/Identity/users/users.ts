import { AfterViewInit, Component, inject, ChangeDetectionStrategy, model, ChangeDetectorRef } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalConfig } from '../../../global-config';
import Swal from 'sweetalert2';
import { CustomTable } from '../../../Shared/custom-table/custom-table';
import { AuthService } from '../../../Services/Auth/auth.service';
import { UsersForm } from './users-form/users-form';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Role } from '../roles/roles';
import { LiveAnnouncer } from '@angular/cdk/a11y';

export interface User {
  id: string,
  email: string,
  userName: string,
  firstName?: string,
  lastName?: string,
  dateOfBirth?: string,
  phoneNumber?: string,
  roles: string[],
  active: boolean
}

@Component({
  selector: 'app-users',
  imports: [CommonModule, CustomTable,
    MatListModule, MatIconModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule, MatDatepickerModule,
    MatAutocompleteModule, MatButtonModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()]
})
export class UsersComponent implements AfterViewInit {
  readonly title = "Users";
  readonly tableColumns = [
    { columnDef: 'email', header: 'Email', cssClass: 'w-4/24' },
    { columnDef: 'userName', header: 'Username', cssClass: 'w-4/24' },
    { columnDef: 'firstName', header: 'First Name', cssClass: 'w-3/24' },
    { columnDef: 'lastName', header: 'Last Name', cssClass: 'w-3/24' },
    { columnDef: 'active', header: 'Active', cssClass: 'w-1/24' }
  ]
  readonly separatorKeyCodes: number[] = [ENTER, COMMA];
  readonly currentRole = model('');
  readonly announcer = inject(LiveAnnouncer);
  dataSource = new MatTableDataSource<User>();
  objects: User[] = [];
  isLoading = true;
  expandedElement: User | null = null;
  userQueryForm: FormGroup;
  allRoles: Role[] = [];
  filteredRoles: Role[] = [];
  selectedRoles: Role[] = [];
  private readonly apiAction = `${GlobalConfig.apiUrl}/User`;
  private readonly formDialog = inject(MatDialog);
  private authService = inject(AuthService);
  private readonly token = this.authService.getToken();
  private selectedFile: File | null = null;
  private correlationId: string = uuidv4();
  userRoleClaims: string[] = [];

  constructor(private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) {
    const claims: string[] = this.authService.getRoleClaims();
    if (claims.includes("IdentityAccess")) this.userRoleClaims = ["WriteAccess"];
    window.sessionStorage.setItem('correlationId', this.correlationId);
    this.userQueryForm = this.formBuilder.group({
      email: '',
      userName: '',
      firstName: '',
      lastName: '',
      dateOfBirthFrom: '',
      dateOfBirthTo: '',
      phoneNumber: '',
      active: null,
    })
  }

  ngAfterViewInit() {
    this.fetchData();
    this.fetchRoles();
  }

  fetchData() {
    this.isLoading = true;
    this.userQueryForm.get('roles')?.setValue(this.selectedRoles.map(r => r.id));
    const formValue = this.userQueryForm.value;
    const query = {
      ...formValue,
      dateOfBirthFrom: this.toDateOnlyString(formValue.from),
      dateOfBirthTo: this.toDateOnlyString(formValue.to),
    };

    // Remove empty values from query
    const params = Object.entries(query)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
      .join('&');
    var fetchDataUrl = `${this.apiAction}?${params}`
    fetch(fetchDataUrl, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    })
      .then(async response => {
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) throw new Error('You do not have permission to view this data.')
          let errorMsg = 'Failed to load data.';
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) errorMsg = errorData.message;
          } catch { }
          throw new Error(errorMsg);
        }
        return response.json();
      })
      .then(result => {
        this.objects = result.map((item: any, index: number) => ({
          no: index + 1,
          ...item
        }));
        this.dataSource.data = this.objects;
        this.isLoading = false;
        this.cdr.markForCheck();
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        Swal.fire('Error', error.message, 'error');
        this.isLoading = false;
      });
  }

  onOpenForm(userId?: User) {
    const dialogRef = this.formDialog.open(UsersForm, {
      width: '40%',
      maxWidth: '800px',
      data: userId
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchData();
        Swal.fire({
          title: userId ? "Updated!" : "Created!",
          icon: "success",
          position: 'top',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          backdrop: false
        });
      }
    });
  }

  isExpandedRow = (row: User) => this.expandedElement === row;

  onToggleExpand(row: User, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.expandedElement = this.expandedElement === row ? null : row;

  }

  private toDateOnlyString(date: Date | null): string | null {
    if (!date) return null;
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${date.getFullYear()}-${mm}-${dd}`;
  }

  // Roles autocomplete
  fetchRoles() {
    fetch(`${GlobalConfig.apiUrl}/Roles`, { method: 'GET', headers: { 'Authorization': `Bearer ${this.token}`, 'X-Correlation-ID': this.correlationId, } })
      .then(response => response.json())
      .then((data: Role[]) => {
        this.allRoles = data;
        this.filteredRoles = this.allRoles.slice();
        const roleIds = this.userQueryForm.get('roles')?.value as string[];
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
        this.userQueryForm.get('roles')?.setValue(this.selectedRoles.map(r => r.id));
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
      this.userQueryForm.get('roles')?.setValue(this.selectedRoles.map(r => r.id));
      this.announcer.announce(`Removed ${role.name}`);
      this.filterRoles(this.currentRole());
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const role = this.allRoles.find(r => r.id === event.option.value);
    if (role && !this.selectedRoles.some(r => r.id === role.id)) {
      this.selectedRoles.push(role);
      this.userQueryForm.get('roles')?.setValue(this.selectedRoles.map(r => r.id));
    }
    this.currentRole.set('');
    this.filterRoles('');
  }

  onRoleInputChange(value: string) {
    this.currentRole.set(value);
    this.filterRoles(value);
  }
}
