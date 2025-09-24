import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalConfig } from './../../global-config';
import { CustomTable } from './../../Shared/custom-table/custom-table';
import { AuthService } from './../../Services/Auth/auth.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, AbstractControl, Validators } from '@angular/forms';

import Swal from 'sweetalert2';

export interface AuditLog {
  userId: string,
  action: string,
  description: string,
  entityId?: string, //
  entityName?: string, //
  ipAddress?: string,
  userAgent?: string, //
  timestamp?: string,
  severity?: number,
  correlationId?: string //
}

export interface AuditLogQuery {
  userId?: string,
  action?: string,
  entityId?: string,
  entityName?: string,
  from?: string,
  to?: string,
  severity?: string,
}

@Component({
  selector: 'app-audit-logs',
  imports: [CommonModule, CustomTable, MatListModule, MatIconModule, MatIconModule, MatCardModule, MatExpansionModule, MatFormFieldModule, MatButtonModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css'
})
export class AuditLogsComponent implements AfterViewInit {
  readonly title = "Audit Logs";
  readonly tableColumns = [
    { columnDef: 'userId', header: 'User ID', cssClass: 'w-1/12' },
    { columnDef: 'action', header: 'Action', cssClass: 'w-1/16' },
    { columnDef: 'description', header: 'Description', cssClass: 'w-auto' },
    { columnDef: 'ipAddress', header: 'IP Address', cssClass: 'w-1/10' },
    { columnDef: 'timestamp', header: 'Timestamp', cssClass: 'w-1/6' },
    { columnDef: 'severity', header: 'Severity', cssClass: 'w-1/16' },
  ]
  dataSource = new MatTableDataSource<AuditLog>();
  objects: AuditLog[] = [];
  isLoading = true;
  expandedElement: AuditLog | null = null;
  logQueryForm: FormGroup;

  private readonly apiAction = `${GlobalConfig.apiUrl}/AuditLogs`;
  private selectedFile: File | null = null;
  private authService = inject(AuthService);
  userRoleClaims: string[] = [];

  constructor(private formBuilder: FormBuilder) {
    const claims: string[] = this.authService.getRoleClaims();
    if (claims.includes("AdminAccess")) this.userRoleClaims = ["ReadAccess"];
    this.logQueryForm = this.formBuilder.group({
      userId: '',
      action: '',
      entityId: '',
      entityName: '',
      from: '',
      to: '',
      severity: [null, [Validators.min(0), Validators.max(7)]],
    });
  }

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    const token = this.authService.getToken();
    const query: AuditLogQuery = this.logQueryForm.value;
    // Remove empty values from query
    const params = Object.entries(query)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
      .join('&');

    var fetchDataUrl = `${this.apiAction}?${params}`

    fetch(fetchDataUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async response => {
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('You do not have permission to view this data.');
          }
          let errorMsg = 'Failed to load data';
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) errorMsg = errorData.error;
          } catch { }
          throw new Error(errorMsg);
        }
        return response.json();
      })
      .then(result => {
        this.objects = result.map((items: AuditLog, itemPosition: number) => ({
          no: itemPosition + 1,
          ...items
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

  isExpandedRow = (row: AuditLog) => this.expandedElement === row;

  onToggleExpand(row: AuditLog, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.expandedElement = this.expandedElement === row ? null : row;

  }
}
