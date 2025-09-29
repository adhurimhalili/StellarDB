import { Component, AfterViewInit, ChangeDetectorRef, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/Auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { ApexOptions, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { GlobalConfig } from '../../global-config';


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MatSidenavModule, MatListModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})

export class DashboardComponent implements AfterViewInit {
  readonly bgLink = 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BhY2UlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww';
  planetsByTypeChartOptions: ApexOptions | null = null;
  usersByRoleChartOptions: ApexOptions | null = null;
  userActivityWeekChartOptions: ApexOptions | null = null;
  entityActivityChartOptions: ApexOptions | null = null;
  private cdr = inject(ChangeDetectorRef);

  constructor() { }
  ngAfterViewInit(): void {
    this.fetchPlanetsByType();
    this.fetchUsersByRoles();
    this.fetchUserActivityWeek();
    this.fetchEntityActivity();
  }

  private setPlanetsByTypeChartOptions(data: { type: string; count: number; }[]) {
    const categories = data.map(d => d.type);
    const seriesData = data.map(d => d.count);

    this.planetsByTypeChartOptions = {
      series: [
        {
          name: 'Count',
          data: seriesData
        }
      ],
      chart: {
        height: 350,
        width: 600,
        type: 'bar',
        toolbar: {
          show: true, // Enable or disable the toolbar (default is true)
          tools: {
            download: true, // Enable/disable download button
            selection: true, // Enable/disable zoom selection
            zoom: true, // Enable/disable zoom button
            zoomin: true, // Enable/disable zoom-in button
            zoomout: true, // Enable/disable zoom-out button
            pan: true, // Enable/disable pan button
            reset: true // Enable/disable reset button
          },
          autoSelected: 'zoom' // Set the default tool (e.g., 'zoom', 'pan', 'selection', or 'reset')
        }
      },
      xaxis: {
        categories: categories // Add this to map types to x-axis
      }
    };
    this.cdr.markForCheck();
  }

  private setUsersByRoleChartOptions(data: { role: string; count: number; }[]) {
    const categories = data.map(d => d.role);
    const seriesData = data.map(d => d.count);

    this.usersByRoleChartOptions = {
      series: [
        {
          name: 'Count',
          data: seriesData
        }
      ],
      chart: {
        height: 350,
        width: 600,
        type: 'bar',
        toolbar: {
          show: true, // Enable or disable the toolbar (default is true)
          tools: {
            download: true, // Enable/disable download button
            selection: true, // Enable/disable zoom selection
            zoom: true, // Enable/disable zoom button
            zoomin: true, // Enable/disable zoom-in button
            zoomout: true, // Enable/disable zoom-out button
            pan: true, // Enable/disable pan button
            reset: true // Enable/disable reset button
          },
          autoSelected: 'zoom' // Set the default tool (e.g., 'zoom', 'pan', 'selection', or 'reset')
        }
      },
      xaxis: {
        categories: categories // Add this to map types to x-axis
      }
    };
    this.cdr.markForCheck();
  }

  private setUserActivityWeekChartOptions(data: { day: string; count: number; }[]) {
    const categories = data.map(d => d.day);
    const seriesData = data.map(d => d.count);

    this.userActivityWeekChartOptions = {
      series: [
        {
          name: 'Count',
          data: seriesData
        }
      ],
      chart: {
        height: 350,
        width: 600,
        type: 'line',
        toolbar: {
          show: true, // Enable or disable the toolbar (default is true)
          tools: {
            download: true, // Enable/disable download button
            selection: true, // Enable/disable zoom selection
            zoom: true, // Enable/disable zoom button
            zoomin: true, // Enable/disable zoom-in button
            zoomout: true, // Enable/disable zoom-out button
            pan: true, // Enable/disable pan button
            reset: true // Enable/disable reset button
          },
          autoSelected: 'zoom' // Set the default tool (e.g., 'zoom', 'pan', 'selection', or 'reset')
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 4
      },
      xaxis: {
        categories: categories // Add this to map types to x-axis
      }
    };
    this.cdr.markForCheck();
  }

  private setEntityActivityChartOptions(data: { entity: string; count: number; }[]) {
    const categories = data.map(d => d.entity);
    const seriesData = data.map(d => d.count);

    this.entityActivityChartOptions = {
      series: [
        {
          name: 'Count',
          data: seriesData
        }
      ],
      chart: {
        height: 350,
        width: 600,
        type: 'bar',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          },
          autoSelected: 'zoom'
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          barHeight: '70%',
          distributed: false,
        }
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#4e88b4'],
      xaxis: {
        categories: categories
      }
    };
    this.cdr.markForCheck();
  }

  fetchPlanetsByType() {
    fetch(`${GlobalConfig.apiUrl}/Home/planets-by-type`, { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        // Expecting data: [{ type: string, count: number }, ...]
        const arr = Object.entries(data).map(([type, count]) => ({ type, count: Number(count) }));
        this.setPlanetsByTypeChartOptions(arr);
      })
      .catch(error => console.error('Error fetching planet types:', error));
  }

  fetchUsersByRoles() {
    fetch(`${GlobalConfig.apiUrl}/Statistics/user-count`, { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        // Expecting data: [{ type: string, count: number }, ...]
        const arr = Object.entries(data).map(([role, count]) => ({ role, count: Number(count) }));
        this.setUsersByRoleChartOptions(arr);
      })
      .catch(error => console.error('Error fetching planet types:', error));
  }

  fetchUserActivityWeek() {
    fetch(`${GlobalConfig.apiUrl}/Statistics/user-activity`, { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        // Expecting data: [{ type: string, count: number }, ...]
        const arr = Object.entries(data).map(([day, count]) => ({ day, count: Number(count) }));
        this.setUserActivityWeekChartOptions(arr);
      })
      .catch(error => console.error('Error fetching planet types:', error));
  }

  fetchEntityActivity() {
    fetch(`${GlobalConfig.apiUrl}/Statistics/entity-activity`, { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        // Expecting data: [{ type: string, count: number }, ...]
        const arr = Object.entries(data).map(([entity, count]) => ({ entity, count: Number(count) }));
        this.setEntityActivityChartOptions(arr);
      })
      .catch(error => console.error('Error fetching planet types:', error));
  }

}
