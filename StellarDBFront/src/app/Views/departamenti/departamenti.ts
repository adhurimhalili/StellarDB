import { AfterViewInit, OnDestroy, Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartamentiForm } from './departamenti-form/departamenti-form';

export interface Departament {
  id: string,
  emriDepartamentit: string,
  numriZyrave: number
}

@Component({
  selector: 'app-departamenti',
  imports: [
    CommonModule,
    CustomTable,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './departamenti.html',
  styleUrl: './departamenti.css'
})
export class DepartamentiComponent {
  readonly title = 'Departamentet'; // ndrysho titullin
  // ndrysho kolonat sipas interface
  readonly tableColumns = [
    { columnDef: 'emriDepartamentit', header: 'emriFestivalit', },
    { columnDef: 'numriZyrave', header: 'numriZyrave', },
  ];

  dataSource = new MatTableDataSource<Departament>();
  objects: Departament[] = [];
  isLoading = true;

  private readonly apiAction = `${GlobalConfig.apiUrl}/Departamenti`; // Shkruaj emrin e Controller-it
  private readonly dialog = inject(MatDialog);
  userRoleClaims: string[] = ["ReadAccess", "WriteAccess"];

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    fetch(this.apiAction, {
      method: 'GET'
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

  onOpenForm(departamentiId?: string) {
    const dialogRef = this.dialog.open(DepartamentiForm, {
      width: '60%',
      maxWidth: '1000px',
      data: departamentiId
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchData();
        Swal.fire({
          title: departamentiId ? "Updated!" : "Created!",
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
