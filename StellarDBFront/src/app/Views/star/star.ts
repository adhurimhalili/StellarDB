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
import { StarForm } from './star-form/star-form';

export interface Star {
  id: string;
  name: string;
  spectralClassCode?: string;
  magnitude: number;
  distance: number;
  diameter: number;
  mass: number;
  temperature: number;
  discoveryDate: string; // dateOnly in C# not supported in TypeScript
}

@Component({
  selector: 'app-star',
  imports: [CustomTable, CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule],
  templateUrl: './star.html',
  styleUrl: './star.css'
})
export class StarComponent implements AfterViewInit {
  availableActions: string[] = ['create', 'edit', 'delete', 'import', 'export'];
  tableColumns = [
    { columnDef: 'position', header: 'No.', cell: (item: any) => `${item.no}`, cssClass: 'w-1/32' },
    { columnDef: 'name', header: 'Name', cssClass: 'w-1/24' },
    { columnDef: 'spectralClassCode', header: 'Spectral Class' },
    { columnDef: 'magnitude', header: 'Magnitude', cssClass: 'w-1/16' },
    { columnDef: 'distance', header: 'Distance (ly)' },
    { columnDef: 'diameter', header: 'Diameter (km)' },
    { columnDef: 'mass', header: 'Mass (M☉)' },
    { columnDef: 'temperature', header: 'Temperature (K)' },
    { columnDef: 'discoveryDate', header: 'Discovery Date' }
  ];

  title = 'Stars';
  dataSource = new MatTableDataSource<Star>();
  objects: Star[] = [];
  isLoading = true;

  private readonly formDialog = inject(MatDialog);
  private selectedFile: File | null = null;
  private apiAction = `${GlobalConfig.apiUrl}/Star`;

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    fetch(`${this.apiAction}`)
      .then(response => response.json())
      .then(result => {
        this.objects = result.map((item: Star, itemPosition: number) => ({
          no: itemPosition + 1,
          id: item.id,
          name: item.name,
          spectralClassCode: item.spectralClassCode,
          magnitude: item.magnitude,
          distance: item.distance,
          diameter: item.diameter,
          mass: item.mass,
          temperature: item.temperature,
          discoveryDate: item.discoveryDate
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

  onOpenForm(starId?: string) {
    const dialogRef = this.formDialog.open(StarForm, {
      width: '40%',
      maxWidth: '600px',
      data: starId
    });
    dialogRef.afterClosed().subscribe(result => {
      this.fetchData();
      if (result) {
        Swal.fire({
          title: starId ? "Updated!" : "Created!",
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

  onDelete(star: Star) {
    Swal.fire({
      title: 'Are you sure?',
      html: `You are deleting <span class="text-blue-600 font-medium">${star.name}<span>.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${this.apiAction}/${star.id}`, { method: 'DELETE' })
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

  onImportFile(event: Event) {
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
