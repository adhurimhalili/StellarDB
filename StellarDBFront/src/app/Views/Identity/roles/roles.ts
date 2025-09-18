import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { GlobalConfig } from '../../../global-config';
import { CustomTable } from '../../../Shared/custom-table/custom-table';
import { RolesForm } from './roles-form/roles-form';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../Services/Auth/auth.service';

export interface Role {
  id: string,
  name: string,
  description: string,
  roleClaims: { claimType: string; claimValue: string; }
}

@Component({
  selector: 'app-roles',
  imports: [CustomTable, CommonModule, MatCardModule, MatListModule, MatIconModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class RolesComponent implements AfterViewInit {
  readonly title = 'Roles';
  readonly tableColumns = [
    { columnDef: 'name', header: 'Name', cssClass: 'w-1/24' },
    { columnDef: 'description', header: 'Description', cssClass: 'auto' },
  ]
  dataSource = new MatTableDataSource<Role>();
  objects: Role[] = [];
  isLoading = true;
  expandedElement: Role | null = null;
  private readonly apiAction = `${GlobalConfig.apiUrl}/Roles`;
  private readonly formDialog = inject(MatDialog);
  private selectedFile: File | null = null;
  private authService = inject(AuthService);
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
    const token = this.authService.getToken();
    fetch(this.apiAction, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => response.json())
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
        Swal.fire('Error', 'Failed to load roles data.', 'error');
        this.isLoading = false;
      });
  }

  onOpenForm(roleId?: string) {
    const dialogRef = this.formDialog.open(RolesForm, {
      width: '40%',
      maxWidth: '800px',
      data: roleId
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchData();
        Swal.fire({
          title: roleId ? "Updated!" : "Created!",
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

  onDelete(role: Role) {
    return;
  }

  onImportFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.onImport();
    }
  }

  onImport() {
    return;
  }

  onExport(format: string) {
    return;
  }

  isExpandedRow = (row: Role) => this.expandedElement === row;

  onToggleExpand(row: Role, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.expandedElement = this.expandedElement === row ? null : row;
  }
}
