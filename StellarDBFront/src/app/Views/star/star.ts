import { AfterViewInit, Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { AuthService } from '../../Services/Auth/auth.service';
import { MatExpansionModule } from '@angular/material/expansion'; // MatFormFieldModule, MatInputModule, MatInputModule, MatSelectModule, MatDatepickerModule, ReactiveFormsModule,
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { v4 as uuidv4 } from 'uuid';
import { provideNativeDateAdapter } from '@angular/material/core';
import { StarLuminosityClasses } from '../star-luminosity-classes/star-luminosity-classes';
import { StarSpectralClasses } from '../star-spectral-classes/star-spectral-classes';

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
  planets: string[];
}

@Component({
  selector: 'app-star',
  imports: [CustomTable, CommonModule, ReactiveFormsModule,
    MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatMenuModule, NgApexchartsModule, MatExpansionModule,
    MatFormFieldModule, MatInputModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatChipsModule],
  templateUrl: './star.html',
  styleUrl: './star.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
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
  dataSource = new MatTableDataSource<Star>();
  objects: Star[] = [];
  starSpectralClasses: StarSpectralClasses[] = [];
  starLuminosityClasses: StarLuminosityClasses[] = [];
  isLoading = true;
  expandedElement: Star | null = null;
  starQueryForm: FormGroup;

  private readonly apiAction = `${GlobalConfig.apiUrl}/Star`;
  private readonly formDialog = inject(MatDialog);
  private selectedFile: File | null = null;
  private correlationId: string = uuidv4();
  private authService = inject(AuthService);
  private readonly token = this.authService.getToken();
  userRoleClaims: string[] = [];

  constructor(private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) {
    this.userRoleClaims = this.authService.getRoleClaims();
    window.sessionStorage.setItem('correlationId', this.correlationId);
    this.starQueryForm = this.formBuilder.group({
      name: '',
      starId: '',
      spectralClassId: '',
      luminosityClassId: '',
      minMagnitude: [null, [Validators.min(0)]],
      maxMagnitude: [null, [Validators.min(0)]],
      minMass: [null, [Validators.min(0)]],
      maxMass: [null, [Validators.min(0)]],
      minDistance: [null, [Validators.min(0)]],
      maxDistance: [null, [Validators.min(0)]],
      minDiameter: [null, [Validators.min(0)]],
      maxDiameter: [null, [Validators.min(0)]],
      minTemperature: [null, [Validators.min(0)]],
      maxTemperature: [null, [Validators.min(0)]],
      from: '',
      to: ''
    })
  }

  ngAfterViewInit() {
    this.fetchData();
    this.fetchSpectralClasses();
    this.fetchLuminosityClasses();
  }

  fetchSpectralClasses() {
    fetch(`${GlobalConfig.apiUrl}/StarSpectralClasses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'X-Correlation-ID': this.correlationId,
      }
    })
      .then(async response => {
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return [];
          }
          let errorMsg = 'Failed to load spectral classes';
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              if (errorData && errorData.error) errorMsg = errorData.error;
            } catch { }
          }
          return [];
        }
        const text = await response.text();
        if (!text) return [];
        return JSON.parse(text);
      })
      .then(data => {
        this.starSpectralClasses = data;
      });
  }

  fetchLuminosityClasses() {
    fetch(`${GlobalConfig.apiUrl}/StarLuminosityClasses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'X-Correlation-ID': this.correlationId,
      }
    })
      .then(async response => {
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return [];
          }
          let errorMsg = 'Failed to load luminosity classes';
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json();
              if (errorData && errorData.error) errorMsg = errorData.error;
            } catch { }
          }
          return [];
        }
        const text = await response.text();
        if (!text) return [];
        return JSON.parse(text);
      })
      .then(data => {
        this.starLuminosityClasses = data;
      });
  }

  fetchData() {
    this.isLoading = true;
    const formValue = this.starQueryForm.value;
    const query = {
      ...formValue,
      from: this.toDateOnlyString(formValue.from),
      to: this.toDateOnlyString(formValue.to),
    };

    // Remove empty values from query
    const params = Object.entries(query)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
      .join('&');
    var fetchDataUrl = `${this.apiAction}?${params}`
    fetch(fetchDataUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${this.token}`, 'X-Correlation-ID': this.correlationId, } })
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
        this.objects = result.map((items: Star, itemPosition: number) => ({
          no: itemPosition + 1,
          ...items
        }));
        this.dataSource.data = this.objects;
        this.isLoading = false;
        this.cdr.markForCheck();
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        Swal.fire('Error', error.message, 'error');
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
        const token = this.authService.getToken();
        fetch(`${this.apiAction}/${star.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
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
      let filename = `stars.${format}`;
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

  private toDateOnlyString(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    let d: Date;
    if (typeof date === 'string') {
      d = new Date(date);
      if (isNaN(d.getTime())) return null;
    } else {
      d = date;
    }
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
}
