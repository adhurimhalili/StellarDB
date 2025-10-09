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
import { AsistentiForm } from './asistenti-form/asistenti-form'
import { Departament } from '../departamenti/departamenti';

export interface Asistent {
  id: string,
  emri: string,
  mbiemrin: string,
  pozita: string,
  id_Departamenti: string
}

@Component({
  selector: 'app-asistenti',
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
  templateUrl: './asistenti.html',
  styleUrl: './asistenti.css'
})
export class AsistentiComponent {
  readonly title = 'Asistentet'; // ndrysho titullin
  // ndrysho kolonat sipas interface
  readonly tableColumns = [
    { columnDef: 'emri', header: 'emri', },
    { columnDef: 'mbiemrin', header: 'mbiemrin', },
    { columnDef: 'pozita', header: 'pozita', },
    { columnDef: 'id_Departamenti', header: 'id_Departamenti', },
  ];
  departamentet: Departament[] = [];
  asistentiQueryForm: FormGroup; // Ndrysho variablen
  dataSource = new MatTableDataSource<Event>();
  objects: Event[] = [];
  isLoading = true;

  private readonly apiAction = `${GlobalConfig.apiUrl}/Asistenti`; // Shkruaj emrin e Controller-it
  private readonly dialog = inject(MatDialog);
  private selectedFile: File | null = null;
  userRoleClaims: string[] = ["ReadAccess", "WriteAccess"];

  constructor(private formBuilder: FormBuilder) {
    this.asistentiQueryForm = this.formBuilder.group({
      departamentiId: null
    })
  }

  ngAfterViewInit() {
    this.fetchData();
    this.fetchDepartamentet();
  }

  fetchData() {
    this.isLoading = true;
    const formValue = this.asistentiQueryForm.value;
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

  onOpenForm(asistentiId?: string) {
    const dialogRef = this.dialog.open(AsistentiForm, {
      width: '60%',
      maxWidth: '1000px',
      data: asistentiId
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchData();
        Swal.fire({
          title: asistentiId ? "Updated!" : "Created!",
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

  fetchDepartamentet() { // ndrysho sipas controllerin TJETER
    fetch(`${GlobalConfig.apiUrl}/Departamenti`, { method: 'GET' })
      .then(response => response.json())
      .then(data => this.departamentet = data)
      .catch(error => console.error('Error fetching stars:', error));
  }

}
