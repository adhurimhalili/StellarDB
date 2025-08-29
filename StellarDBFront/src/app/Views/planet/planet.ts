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
import { PlanetForm } from './planet-form/planet-form';

export interface Planet {
  id: string;
  name: string;
  star?: string;
  planetType: string;
  mass: number;
  diameter: number;
  rotationPeriod: number;
  orbitalPeriod: number;
  orbitalEccentricity: number;
  orbitalInclination: number;
  semiMajorAxis: number;
  distanceFromStar: number;
  surfaceTemperature: number;
  discoveryDate: string; // dateOnly in C# not supported in TypeScript
  description?: string;
}

@Component({
  selector: 'app-planet',
  imports: [CustomTable, CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule],
  templateUrl: './planet.html',
  styleUrl: './planet.css'
})
export class PlanetComponent implements AfterViewInit {
  availableActions: string[] = ['create', 'edit', 'delete', 'import', 'export'];
  tableColumns = [
    { columnDef: 'position', header: 'No.', cell: (item: any) => `${item.no}`, cssClass: 'w-1/32' },
    { columnDef: 'name', header: 'Name', cssClass: 'w-1/24' },
    { columnDef: 'starName', header: 'Star' },
    { columnDef: 'planetTypeName', header: 'Type' },
    { columnDef: 'mass', header: 'Mass (M⊕)' },
    { columnDef: 'diameter', header: 'Diameter (km)' },
    { columnDef: 'rotationPeriod', header: 'Rotation Period (h)' },
    { columnDef: 'orbitalPeriod', header: 'Orbital Period (days)' },
    { columnDef: 'orbitalEccentricity', header: 'Eccentricity' },
    { columnDef: 'orbitalInclination', header: 'Inclination (°)' },
    { columnDef: 'semiMajorAxis', header: 'Semi-Major Axis (AU)' },
    { columnDef: 'distanceFromStar', header: 'Distance from Star (AU)' },
    { columnDef: 'surfaceTemperature', header: 'Surface Temp. (K)' },
    { columnDef: 'discoveryDate', header: 'Discovery Date' }
  ];
  title = 'Planets';
  dataSource = new MatTableDataSource<Planet>();
  objects: Planet[] = [];
  isLoading = true;
  private readonly formDialog = inject(MatDialog);
  private selectedFile: File | null = null;
  private readonly apiAction = `${GlobalConfig.apiUrl}/Planet`;
  expandedElement: Planet | null = null;

  isExpandedRow = (row: Planet) => this.expandedElement === row;

  onToggleExpand(row: Planet, event?: Event) {
    if (event) {
      event.stopPropagation(); // prevents row click from bubbling
    }
    this.expandedElement = this.expandedElement === row ? null : row;
  }

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    fetch(this.apiAction)
      .then(response => response.json())
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
        Swal.fire('Error', 'Failed to load planets data.', 'error');
        this.isLoading = false;
      });
  }

  onOpenForm(planetId?: string) {
    const dialogRef = this.formDialog.open(PlanetForm, {
      width: '60%',
      maxWidth: '1000px',
      data: planetId
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchData();
        Swal.fire({
          title: planetId ? "Updated!" : "Created!",
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

  onDelete(planet: Planet) {
    Swal.fire({
      title: 'Are you sure?',
      html: `You are deleting <span class="text-blue-600 font-medium">${planet.name}<span>.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        fetch(`${this.apiAction}/${planet.id}`, { method: 'DELETE' })
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
            console.error('Error deleting planet:', error);
            Swal.fire('Error', 'Failed to delete planet.', 'error');
          });
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
