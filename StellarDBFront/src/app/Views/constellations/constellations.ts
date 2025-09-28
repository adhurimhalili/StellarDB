import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { GlobalConfig } from '../../global-config';
import { CustomTable } from '../../Shared/custom-table/custom-table';
import { ConstellationsForm } from './constellations-form/constellations-form';
import { AuthService } from '../../Services/Auth/auth.service';

export interface Constellation {
  id: string,
  name: string,
  starId: string[],
  description: string
}

@Component({
  selector: 'app-constellations',
  imports: [CustomTable, CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule],
  templateUrl: './constellations.html',
  styleUrl: './constellations.css'
})
export class ConstellationsComponent implements AfterViewInit {
  readonly title = 'Atmospheric Gases';
  readonly tableColumns = [
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'stars', header: 'Stars' },
    { columnDef: 'description', header: 'Description' }
  ]
  dataSource = [];
  objects: Constellation[] = [];
  isLoading = true;
  private readonly apiAction = `${GlobalConfig.apiUrl}/Constellations`;
  private readonly formDialog = inject(MatDialog);
  private authService = inject(AuthService);

  userRoleClaims: string[] = ["ReadAccess", "WriteAccess"];

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    const token = this.authService.getToken();
    fetch(this.apiAction, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
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
        this.objects = result.map((item: Constellation, itemPosition: number) => ({
          index: itemPosition + 1,
          ...item
        }));
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        Swal.fire('Error', error.message, 'error');
        this.isLoading = false;
      });
  }

  onOpenForm(objectId?: string) {
    const dialogRef = this.formDialog.open(ConstellationsForm, {
      data: objectId,
      width: '600px',
      height: 'auto',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchData();
        Swal.fire({
          title: objectId ? "Updated!" : "Created!",
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

}
