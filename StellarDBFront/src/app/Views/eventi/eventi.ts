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
import { EventiForm } from './eventi-form/eventi-form' ;
// copy paste imports

export interface Event {
  id: string,
  emriEventit: string,
  orari: string,
  id_Festivali: string
}


@Component({
  selector: 'app-eventi',
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
  templateUrl: './eventi.html',
  styleUrl: './eventi.css'
})
export class Eventi implements AfterViewInit {
  readonly title = 'Eventet';
  readonly tableColumns = [
    { columnDef: 'emriEventit', header: 'emriEventit', },
    { columnDef: 'orari', header: 'Orari', },
    { columnDef: 'id_Festivali', header: 'id_Festivali', },
  ];

  eventiQueryForm: FormGroup;
  dataSource = new MatTableDataSource<Event>();
  objects: Event[] = [];
  isLoading = true;
  expandedElement: Event | null = null;

  private readonly apiAction = `${GlobalConfig.apiUrl}/Eventi`; // Shkruaj emrin e Controller-it
  private readonly dialog = inject(MatDialog);
  private selectedFile: File | null = null;
  userRoleClaims: string[] = ["ReadAccess", "WriteAccess"];

  constructor(private formBuilder: FormBuilder) {
    this.eventiQueryForm = this.formBuilder.group({
      festivaliId: ''
    })
  }

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    const formValue = this.eventiQueryForm.value;
    const query = {
      ...formValue
    }
    const params = Object.entries(query)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
      .join('&');
    var fetchDataUrl = `${this.apiAction}?${params}`
    fetch(fetchDataUrl, {
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
    const dialogRef = this.dialog.open(EventiForm, {
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

  onDelete(eventi: Event) {
    Swal.fire({
      title: 'Are you sure?',
      html: `You are deleting <span class="text-blue-600 font-medium">${eventi.emriEventit}<span>.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`${this.apiAction}/${eventi.id}`, { method: 'DELETE' })
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
