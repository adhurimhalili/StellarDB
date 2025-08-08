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
import { ChemicalElementsForm } from './chemical-elements-form/chemical-elements-form';

export interface ChemicalElement {
  id: string;
  atomicNumber: number;
  atomicWeight: number;
  symbol: string;
  name: string;
  meltingPoint: number;
  boilingPoint: number;
  period: number;
  group: number;
  discoveryYear: string;
  description?: string;
}

@Component({
  selector: 'app-chemical-elements',
  imports: [CustomTable, CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule],
  templateUrl: './chemical-elements.html',
  styleUrl: './chemical-elements.css'
})
export class ChemicalElementsComponent implements AfterViewInit {
  availableActions: string[] = ['create', 'edit', 'delete', 'import', 'export'];
  tableColumns = [
    { columnDef: 'atomicNumber', header: 'Atomic Number', cssClass: 'w-1/10' },
    { columnDef: 'symbol', header: 'Symbol' },
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'atomicWeight', header: 'Atomic Weight' },
    { columnDef: 'meltingPointText', header: 'Melting Point (K)' },
    { columnDef: 'boilingPointText', header: 'Boiling Point (K)' },
    { columnDef: 'period', header: 'Period' },
    { columnDef: 'group', header: 'Group' },
    { columnDef: 'discoveryYear', header: 'Discovery Year' }
  ];
  title = 'Chemical Elements';
  dataSource = [];
  objects: ChemicalElement[] = [];
  isLoading = true;
  private readonly formDialog = inject(MatDialog);
  private selectedFile: File | null = null;
  private apiAction = `${GlobalConfig.apiUrl}/ChemicalElements`;

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    fetch(this.apiAction)
      .then(response => response.json())
      .then(result => {
        this.objects = result.map((item: ChemicalElement, itemPosition: number) => ({
          meltingPointText: item.meltingPoint == null ? "N/A" : item.meltingPoint,
          boilingPointText: item.boilingPoint == null ? "N/A" : item.boilingPoint,
          ...item
        }))
        this.isLoading = false;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        Swal.fire('Error', 'Failed to load chemical elements data.', 'error');
        this.isLoading = false;
      });
  }

  onOpenForm(elementId?: string) {
    const dialogRef = this.formDialog.open(ChemicalElementsForm, {
      width: '40%',
      maxWidth: '600px',
      data: elementId
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchData();
        Swal.fire({
          title: elementId ? "Updated!" : "Created!",
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

  onDelete(element: ChemicalElement) {
    Swal.fire({
      title: 'Are you sure?',
      html: `You are deleting <span class="text-blue-600 font-medium">${element.name} (${element.symbol})<span>.`,
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
