import { Input, Output, EventEmitter, Component, ViewChild, AfterViewInit, OnDestroy, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-custom-table',
  standalone: true,
  templateUrl: './custom-table.html',
  styleUrl: './custom-table.css',
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatPaginatorModule, MatProgressSpinnerModule, MatMenuModule, MatSortModule],
})
// test
export class CustomTable implements OnDestroy, OnChanges, AfterViewInit {
  // Inputs
  @Input() columns: { columnDef: string; header: string; cell?: (element: any) => string; cssClass?: string; }[] = [];
  @Input() objects: any[] = [];
  @Input() dataSource = new MatTableDataSource<any>();
  @Input() isLoading = true;
  @Input() availableActions: string[] = [];

  // Outputs
  @Output() openForm = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() fileSelected = new EventEmitter<any>();
  @Output() export = new EventEmitter<any>();

  get displayedColumns(): string[] {
    const baseColumns = this.columns.map(col => col.columnDef);
    return this.availableActions.includes('edit') || this.availableActions.includes('delete')
      ? [...baseColumns, 'actions']
      : baseColumns;
  }

  constructor(private cdRef: ChangeDetectorRef) { }

  // dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource(this.objects);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges() {
    this.dataSource = new MatTableDataSource(this.objects);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onDelete(row: any) {
    this.delete.emit(row);
  }

  onOpenForm(id?: string) {
    this.openForm.emit(id);
  }

  onExport(format: string) {
    this.export.emit(format);
  }

  onFileSelected(event: Event) {
    this.fileSelected.emit(event);
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    // this.navigationService.unsubscribe();
  }
}
