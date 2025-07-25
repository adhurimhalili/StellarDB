import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StellarObjectTypesForm } from './stellar-object-types-form/stellar-object-types-form';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { GlobalConfig } from '../../global-config';

export interface StellarObjectTypes {
  id: string
  position: number;
  name: string;
  description: string
}

@Component({
  selector: 'app-stellar-object-types',
  standalone: true,
  templateUrl: './stellar-object-types.html',
  styleUrl: './stellar-object-types.css',
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatPaginatorModule, StellarObjectTypesForm, MatProgressSpinnerModule, MatMenuModule],
})
export class StellarObjectTypesService implements AfterViewInit {
  displayedColumns: string[] = ['position', 'name', 'description', 'actions'];
  dataSource = new MatTableDataSource<StellarObjectTypes>();
  isLoading = true;
  readonly formDialog = inject(MatDialog);
  selectedFile: File | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.fetchData();
    this.dataSource.paginator = this.paginator;
  }

  fetchData() {
    fetch(`${GlobalConfig.apiUrl}/StellarObjectTypes`)
      .then(response => response.json())
      .then(result => {
        this.dataSource.data = result.map((item: StellarObjectTypes, itemPosition: number) => ({
          no: itemPosition + 1,
          id: item.id,
          name: item.name,
          description: item.description
        }));
        this.isLoading = false;
      })
      .catch(error => {
        this.isLoading = false;
      });
  }

  form(stellarObjectId?: string) {
    const dialogRef = this.formDialog.open(StellarObjectTypesForm, {
      width: '40%',
      maxWidth: '600px',
      data: stellarObjectId 
    })

    dialogRef.afterClosed().subscribe(result => {
      this.fetchData();
    });
  }

  onDelete(stellarObject: StellarObjectTypes) {
    Swal.fire({
      title: "Are you sure?",
      html: `You are deleting <span class="text-blue-600 font-medium">${stellarObject.name}<span>.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${GlobalConfig.apiUrl}/StellarObjectTypes/${stellarObject.id}`, { method: 'DELETE' })
          .then(response => {
            this.fetchData();
            Swal.fire({
              title: "Deleted!",
              icon: "success",
              position: 'top',
              timer: 1000,
              timerProgressBar: true,
              showConfirmButton: false,
              backdrop: false
            });
          })
          .catch(error => console.log(error));
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.import();
    }
  }

  import() {
    if (!this.selectedFile) return console.error("File not found.");

    const fileFormData = new FormData();
    fileFormData.append('file', this.selectedFile);

    fetch(`${GlobalConfig.apiUrl}/StellarObjectTypes/import`, {
      method: 'POST',
      body: fileFormData
    })
      .then(async response => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error);
        }
        return response.json();
      })
      .then(result => {
        this.fetchData();
        Swal.fire({
          title: "Imported!",
          html:
            `<p>Inserted: <span class="font-medium text-blue-500">${result.inserted}</span></p>
            <p>Skipped: <span class="font-medium text-blue-500">${result.skipped}</span></p>`,
          icon: "success",
          position: 'top',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          backdrop: false
        });
      })
      .catch(error => {
        Swal.fire({
          title: "Error",
          text: error.message,
          icon: "error"
        });
        //console.error("Error uploading file:", error)
      })
  }

  exportAs(format: string) {
    window.open(`${GlobalConfig.apiUrl}/StellarObjectTypes/export?format=${format}`, '_blank');
  }
}
