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
import { AtmosphericGasesForm } from './atmospheric-gases-form/atmospheric-gases-form';

export interface AtmosphericGas {
  id: string;
  formula: string;
  molecularWeight: number;
  name: string;
  density: number;
  boilingPoint: number;
  meltingPoint: number;
  discoveryYear: number;
  description?: string;
}

@Component({
  selector: 'app-atmospheric-gases',
  imports: [CustomTable, CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule],
  templateUrl: './atmospheric-gases.html',
  styleUrl: './atmospheric-gases.css'
})
export class AtmosphericGasesComponent implements AfterViewInit {
  readonly title = 'Atmospheric Gases';
  readonly tableColumns = [
    { columnDef: 'index', header: 'No', cssClass: 'w-1/32' },
    { columnDef: 'molecularWeight', header: 'Molecular Weight (g/mol)' },
    { columnDef: 'formula', header: 'Formula' },
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'density', header: 'Density (kg/m³)' },
    { columnDef: 'meltingPointText', header: 'Melting Point (K)' },
    { columnDef: 'boilingPointText', header: 'Boiling Point (K)' },
    { columnDef: 'discoveryYearText', header: 'Discovery Year' }
  ];
  availableActions: string[] = ['create', 'edit', 'delete', 'import', 'export'];
  dataSource = [];
  objects: AtmosphericGas[] = [];
  isLoading = true;

  private readonly apiAction = `${GlobalConfig.apiUrl}/AtmosphericGases`;
  private readonly formDialog = inject(MatDialog);
  private selectedFile: File | null = null;

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    fetch(this.apiAction, { method: 'GET' })
      .then(response => response.json())
      .then(result => {
        this.objects = result.map((item: AtmosphericGas, itemPosition: number) => ({
          index: itemPosition + 1,
          meltingPointText: item.meltingPoint == null ? "N/A" : item.meltingPoint,
          boilingPointText: item.boilingPoint == null ? "N/A" : item.boilingPoint,
          discoveryYearText: item.discoveryYear == null ? "Ancient" : item.discoveryYear,
          ...item
        }));
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        Swal.fire('Error', 'Failed to load data', 'error');
        this.isLoading = false;
      });
  }

  onOpenForm(objectId?: string) {
    const dialogRef = this.formDialog.open(AtmosphericGasesForm, {
      data: objectId ,
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

  onDelete(element: AtmosphericGas) {
    Swal.fire({
      title: 'Are you sure?',
      html: `You are deleting <span class="text-blue-600 font-medium">${element.name} (${element.formula})<span>.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${this.apiAction}/${element.id}`, { method: 'DELETE' })
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
            console.error('Error deleting data:', error);
            Swal.fire('Error', 'Failed to delete atmospheric gas data.', 'error');
          });
      }
    })
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
