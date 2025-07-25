import { AfterViewInit, Input, Output, EventEmitter, Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@Component({
  selector: 'app-custom-table',
  standalone: true,
  templateUrl: './custom-table.html',
  styleUrl: './custom-table.css',
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatPaginatorModule, MatProgressSpinnerModule, MatMenuModule],
})

export class CustomTable implements OnInit, OnDestroy {
  // Inputs
  @Input() columns: { columnDef: string; header: string; cell?: (element: any) => string }[] = [];
  @Input() objects: any[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() dataSource = new MatTableDataSource<any>();
  @Input() isLoading = true;

  // Outputs
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() import = new EventEmitter<any>();
  @Output() fileSelected = new EventEmitter<any>();
  @Output() export = new EventEmitter<any>();

  constructor(private cdRef: ChangeDetectorRef) { }

  // dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.objects);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.cdRef.detectChanges();
  }

  onDelete(row: any) {
    this.delete.emit(row);
  }

  onOpenForm(id?: string) {
    this.edit.emit(id);
  }

  //onImport() {
  //  this.import.emit();
  //}

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
