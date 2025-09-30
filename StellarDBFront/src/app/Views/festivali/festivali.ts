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
import { FestivaliForm } from './festivali-form/festivali-form';
// copy paste imports

export interface Festival {
  id: string,
  emriFestivalit: string,
  llojiFestivalit: string
}

@Component({
  selector: 'app-festivali',
  // copy paste imports
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
  templateUrl: './festivali.html',
  styleUrl: './festivali.css'
})
export class Festivali implements AfterViewInit {
  readonly title = 'Festivalet';
  readonly tableColumns = [
    { columnDef: 'emriFestivalit', header: 'emriFestivalit', },
    { columnDef: 'llojiFestivalit', header: 'llojiFestivalit', },
  ];

  dataSource = new MatTableDataSource<Festival>();
  objects: Festival[] = [];
  isLoading = true;
  expandedElement: Festival | null = null;

  private readonly apiAction = `${GlobalConfig.apiUrl}/Festivali`; // Shkruaj emrin e Controller-it
  private readonly dialog = inject(MatDialog);
  private selectedFile: File | null = null;
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

  onOpenForm(festivaliId?: string) {
    const dialogRef = this.dialog.open(FestivaliForm, {
      width: '60%',
      maxWidth: '1000px',
      data: festivaliId
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchData();
        Swal.fire({
          title: festivaliId ? "Updated!" : "Created!",
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

  onDelete(festivali: Festival) {
    Swal.fire({
      title: 'Are you sure?',
      html: `You are deleting <span class="text-blue-600 font-medium">${festivali.emriFestivalit}<span>.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`${this.apiAction}/${festivali.id}`, { method: 'DELETE' })
          .then(response => {
            this.fetchData();
            Swal.fire({
              title: "Deleted!",
              icon: "success",
              position: 'top',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
              backdrop: false
            });
          })
          .catch(error => {
            console.error('Error deleting moon:', error);
            Swal.fire('Error', 'Failed to delete moon.', 'error');
          });
      }
    });
  }
}
