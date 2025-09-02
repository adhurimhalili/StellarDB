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
import { StarLuminosityClassesForm } from './star-luminosity-classes-form/star-luminosity-classes-form';

export interface StarLuminosityClasses {
  id: string;
  code: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-star-luminosity-classes',
  imports: [CustomTable, CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule],
  templateUrl: './star-luminosity-classes.html',
  styleUrl: './star-luminosity-classes.css'
})
export class StarLuminosityClassesComponent {
  readonly title = 'Star Luminosity Classes';
  readonly tableColumns = [
    { columnDef: 'position', header: 'No.', cell: (item: any) => `${item.no}`, cssClass: 'w-1/32' },
    { columnDef: 'code', header: 'Code', cssClass: 'w-1/24' },
    { columnDef: 'name', header: 'Name', cssClass: 'w-1/8' },
    { columnDef: 'description', header: 'Description' }
  ];
  availableActions: string[] = ['create', 'edit', 'delete', 'import', 'export'];
  dataSource = new MatTableDataSource<StarLuminosityClasses>();
  objects: StarLuminosityClasses[] = [];
  isLoading = true;

  private readonly apiAction = `${GlobalConfig.apiUrl}/StarLuminosityClasses`;
  private readonly formDialog = inject(MatDialog);
  private selectedFile: File | null = null;

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    fetch(`${this.apiAction}`)
      .then(response => response.json())
      .then(result => {
        this.objects = result.map((item: StarLuminosityClasses, itemPosition: number) => ({
          no: itemPosition + 1,
          id: item.id,
          code: `${item.code}`,
          name: item.name,
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

  onOpenForm(starLuminosityClassId?: StarLuminosityClasses) {
    const dialogRef = this.formDialog.open(StarLuminosityClassesForm, {
      width: '40%',
      maxWidth: '600px',
      data: starLuminosityClassId
    });
    dialogRef.afterClosed().subscribe(result => {
      this.fetchData();
      if (result) {
        Swal.fire({
          title: starLuminosityClassId ? "Updated!" : "Created!",
          icon: 'success',
          position: 'top',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          backdrop: false
        });
      }
    });
  }

  onDelete(starLuminosityClass: StarLuminosityClasses) {
    Swal.fire({
      title: 'Are you sure?',
      html: `You are deleting <span class="text-blue-600 font-medium">${starLuminosityClass.code} - ${starLuminosityClass.name}<span>.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${this.apiAction}/${starLuminosityClass.id}`, { method: 'DELETE' })
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

  onImportFileSelected(event: Event) {
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
