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
import { StarSpectralClassesForm } from './star-spectral-classes-form/star-spectral-classes-form';

export interface StarSpectralClasses {
  id: string;
  code: string;
  temperatureRange: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-star-spectral-classes',
  standalone: true,
  imports: [CustomTable, CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule],
  templateUrl: './star-spectral-classes.html',
  styleUrl: './star-spectral-classes.css'
})
export class StarSpectralClassesComponent implements AfterViewInit {
  title = 'Star Spectral Classes';
  apiAction = `${GlobalConfig.apiUrl}/StarSpectralClasses`;
  availableActions: string[] = ['create', 'edit', 'delete', 'import', 'export'];
  tableColumns = [
    { columnDef: 'position', header: 'No.', cell: (item: any) => `${item.no}`, cssClass: 'w-1/32' },
    { columnDef: 'code', header: 'Code', cssClass: 'w-1/24' },
    { columnDef: 'temperatureRange', header: 'Temperature Range' },
    { columnDef: 'color', header: 'Color', cssClass: 'w-1/16' },
    { columnDef: 'description', header: 'Description' }
  ];

  dataSource = new MatTableDataSource<StarSpectralClasses>();
  objects: StarSpectralClasses[] = []
  isLoading = true;
  readonly formDialog = inject(MatDialog);
  selectedFile: File | null = null;

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    fetch(`${this.apiAction}`)
      .then(response => response.json())
      .then(result => {
        this.objects = result.map((item: StarSpectralClasses, itemPosition: number) => ({
          no: itemPosition + 1,
          id: item.id,
          code: `${item.code}-Type`,
          temperatureRange: item.temperatureRange,
          color: item.color,
          description: item.description
        }));
        this.dataSource.data = this.objects;
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        Swal.fire('Error', 'Failed to load data', 'error');
        this.isLoading = false;
      });
  }

  onOpenForm(starSpectralClassId?: string) {
    const dialogRef = this.formDialog.open(StarSpectralClassesForm, {
      width: '40%',
      maxWidth: '600px',
      data: starSpectralClassId
    });
    dialogRef.afterClosed().subscribe(result => {
      this.fetchData();
      if (result) {
        Swal.fire({
          title: starSpectralClassId ? "Updated!" : "Created!",
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

  onDelete(starSpectralClass: StarSpectralClasses) {
    Swal.fire({
      title: "Are you sure?",
      html: `You are deleting <span class="text-blue-600 font-medium">${starSpectralClass.code}<span>.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${this.apiAction}/${starSpectralClass.id}`, { method: 'DELETE' })
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
          .catch(error => console.log(error));
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.onImport();
    }
  }

  onImport() {
    if (!this.selectedFile) {
      Swal.fire({
        title: "File not found.",
        icon: "error",
        position: 'top',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        backdrop: false
      });
      return;
    }

    const fileFormData = new FormData();
    fileFormData.append('file', this.selectedFile);

    fetch(`${this.apiAction}/import`, {
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
      })
  }

  onExport(format: string) {
    window.open(`${this.apiAction}/export?format=${format}`, '_blank');
  }
}
