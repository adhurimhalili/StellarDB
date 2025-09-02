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
import { ApexOptions, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';

export interface Star {
  id: string;
  name: string;
  spectralClassCode?: string;
  luminosityClassCode?: string;
  magnitude: number;
  distance: number;
  diameter: number;
  mass: number;
  temperature: number;
  discoveryDate: string; // dateOnly in C# not supported in TypeScript
  composition?: { name: string; percentage: number; }[];
  description?: string;
}

@Component({
  selector: 'app-star',
  imports: [CustomTable, CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule, NgApexchartsModule],
  templateUrl: './star.html',
  styleUrl: './star.css'
})
export class StarComponent implements AfterViewInit {
  readonly title = 'Stars';
  readonly tableColumns = [
    { columnDef: 'position', header: 'No.', cell: (item: any) => `${item.no}`, cssClass: 'w-1/32' },
    { columnDef: 'name', header: 'Name', cssClass: 'w-1/24' },
    { columnDef: 'spectralClassCode', header: 'Spectral Class' },
    { columnDef: 'luminosityClassCode', header: 'Luminosity Class' },
    { columnDef: 'magnitude', header: 'Magnitude', cssClass: 'w-1/16' },
    { columnDef: 'distance', header: 'Distance (ly)' },
    { columnDef: 'diameter', header: 'Diameter (km)' },
    { columnDef: 'mass', header: 'Mass (M☉)' },
    { columnDef: 'temperature', header: 'Temperature (K)' },
    { columnDef: 'discoveryDate', header: 'Discovery Date' }
  ];
  availableActions: string[] = ['create', 'edit', 'delete', 'import', 'export'];
  dataSource = new MatTableDataSource<Star>();
  objects: Star[] = [];
  isLoading = true;
  expandedElement: Star | null = null;

  private readonly apiAction = `${GlobalConfig.apiUrl}/Star`;
  private readonly formDialog = inject(MatDialog);
  private selectedFile: File | null = null;

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    fetch(`${this.apiAction}`)
      .then(response => response.json())
      .then(result => {
        this.objects = result.map((items: Star, itemPosition: number) => ({
          no: itemPosition + 1,
          ...items
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
      width: '60%',
      maxWidth: '1000px',
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

  isExpandedRow = (row: Star) => this.expandedElement === row;

  onToggleExpand(row: Star, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.expandedElement = this.expandedElement === row ? null : row;
  }

  compositionChart(star: Star): ApexOptions | null {
    if (!star.composition?.length) return null;

    return {
      series: star.composition.map(c => c.percentage),
      chart: {
        height: 350,
        type: 'radialBar',
      },
      title: {
        text: `Chemical Composition`,
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#263238'
        }
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: '30%',
            background: 'transparent',
            image: undefined,
          },
          dataLabels: {
            name: {
              show: true,
            },
            value: {
              show: true,
              formatter: (val) => `${val}%`
            },
          },
          barLabels: {
            enabled: true,
            offsetX: -8,
          },
          track: {
            show: true,
            background: '#c1c1c1',
          }
        }
      },
      labels: star.composition.map(c => c.name),
      legend: {
        show: true,
        floating: true,
        position: 'right',
        offsetX: 0,
        offsetY: 0,
        formatter: function (seriesName: string, opts: any) {
          return `${seriesName}: <b>${opts.w.globals.series[opts.seriesIndex]}%</b>`
        }
      },
      colors: [
        // Using different color scheme for composition to distinguish from atmosphere
        '#FF6B6B', // Red
        '#4CAF50', // Green
        '#2196F3', // Blue
        '#FFC000', // Yellow
        '#9C27B0', // Purple
        '#795548', // Brown
        '#00BCD4', // Cyan
        '#FF9800', // Orange
        '#607D8B', // Blue Grey
        '#E91E63'  // Pink
      ]
    };
  }
}
