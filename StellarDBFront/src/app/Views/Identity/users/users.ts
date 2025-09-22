import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalConfig } from '../../../global-config';
import Swal from 'sweetalert2';
import { CustomTable } from '../../../Shared/custom-table/custom-table';
import { AuthService } from '../../../Services/Auth/auth.service';
import { UsersForm } from './users-form/users-form';
import { MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

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
  imports: [CommonModule, CustomTable, MatListModule, MatIconModule, MatCardModule, MatChipsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
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
  dataSource = new MatTableDataSource<User>();
  objects: User[] = [];
  isLoading = true;
  expandedElement: User | null = null;
  private readonly apiAction = `${GlobalConfig.apiUrl}/User`;
  private readonly formDialog = inject(MatDialog);
  private authService = inject(AuthService);
  private selectedFile: File | null = null;
  userRoleClaims: string[] = [];

  constructor() {
    const claims: string[] = this.authService.getRoleClaims();
    if (claims.includes("IdentityAccess")) this.userRoleClaims = ["WriteAccess"];
  }

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    fetch(this.apiAction, {
      headers: { 'Authorization': `Bearer ${this.authService.getToken()}` }
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
}
