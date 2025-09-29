import { AfterViewInit, Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ApexOptions, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { GlobalConfig } from '../../global-config';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, NgApexchartsModule],
})
export class Home implements AfterViewInit {
  protected readonly title = signal('StellarDB');
  readonly bgLink = 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BhY2UlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww';
  chartOptions: ApexOptions | null = null;
  private cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    this.fetchPlanetsByType();
  }

  private setChartOptions(data: { type: string; count: number; }[]) {
    const categories = data.map(d => d.type);
    const seriesData = data.map(d => d.count);

    this.chartOptions = {
      series: [
        {
          name: 'Count',
          data: seriesData
        }
      ],
      chart: {
        height: 350,
        width: 800,
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
      },
      title: {
        text: `Planets by Type`,
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#263238'
        }
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
        this.setChartOptions(arr);
      })
      .catch(error => console.error('Error fetching planet types:', error));
  }
}
