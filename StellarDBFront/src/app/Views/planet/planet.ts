import { AfterViewInit, OnDestroy, Component, inject } from '@angular/core';
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
import { ApexOptions, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { AuthService } from '../../Services/Auth/auth.service';

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
  composition?: { name: string; percentage: number; }[];
  atmosphere?: { name: string; percentage: number; }[];
}

@Component({
  selector: 'app-planet',
  imports: [NgApexchartsModule, CustomTable, CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule],
  templateUrl: './planet.html',
  styleUrl: './planet.css'
})
export class PlanetComponent implements AfterViewInit {
  readonly title = 'Planets';
  readonly tableColumns = [
    { columnDef: 'position', header: 'No.', cell: (item: any) => `${item.no}`, cssClass: 'w-1/32' },
    { columnDef: 'name', header: 'Name', cssClass: 'w-1/24' },
    { columnDef: 'starName', header: 'Star' },
    { columnDef: 'planetTypeName', header: 'Type' },
    { columnDef: 'mass', header: 'Mass (M⊕)' },
    { columnDef: 'diameter', header: 'Diameter (km)' },
    { columnDef: 'rotationPeriod', header: 'Rotation Period (h)' },
    { columnDef: 'orbitalPeriod', header: 'Orbital Period (days)' },
    { columnDef: 'surfaceTemperature', header: 'Surface Temp. (K)' },
    { columnDef: 'discoveryDate', header: 'Discovery Date' }
  ];
  dataSource = new MatTableDataSource<Planet>();
  objects: Planet[] = [];
  isLoading = true;
  expandedElement: Planet | null = null;

  private readonly apiAction = `${GlobalConfig.apiUrl}/Planet`;
  private readonly formDialog = inject(MatDialog);
  private selectedFile: File | null = null;
  private authService = inject(AuthService);
  userRoleClaims: string[] = [];

  constructor() {
    this.userRoleClaims = this.authService.getRoleClaims();
  }

  ngAfterViewInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    const token = this.authService.getToken();
    fetch(this.apiAction, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
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
        const token = this.authService.getToken();
        fetch(`${this.apiAction}/${planet.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
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
    const token = this.authService.getToken();
    fetch(`${this.apiAction}/import`, {
      method: 'POST',
      body: fileFormData,
      headers: { 'Authorization': `Bearer ${token}` }
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

  async onExport(format: string) {
    const token = this.authService.getToken();
    const url = `${this.apiAction}/export?format=${format}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to export data');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const disposition = response.headers.get('Content-Disposition');
      let filename = `planet.${format}`;
      if (disposition) {
        const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error"
      });
    }
  }

  isExpandedRow = (row: Planet) => this.expandedElement === row;

  onToggleExpand(row: Planet, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.expandedElement = this.expandedElement === row ? null : row;
  }

  atmosphereChart(planet: Planet): ApexOptions | null {
    if (!planet.atmosphere?.length) return null;

    return {
      series: planet.atmosphere.map(a => a.percentage),
      chart: {
        height: 350,
        type: 'radialBar',
      },
      title: {
        text: `Atmospheric Composition`,
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
      labels: planet.atmosphere.map(a => a.name),
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
        '#00B0F0', '#92D050', '#FFC000', '#FF6B6B', '#B895FF',
        '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#795548'
      ]
    };
  }

  compositionChart(planet: Planet): ApexOptions | null {
    if (!planet.composition?.length) return null;

    return {
      series: planet.composition.map(c => c.percentage),
      chart: {
        height: 350,
        type: 'radialBar',
      },
      title: {
        text: `Geological Composition`,
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
      labels: planet.composition.map(c => c.name),
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
