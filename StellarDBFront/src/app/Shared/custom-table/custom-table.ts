import { Input, Output, EventEmitter, Component, ViewChild, AfterViewInit, OnDestroy, OnChanges, ChangeDetectorRef } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-custom-table',
  standalone: true,
  templateUrl: './custom-table.html',
  styleUrl: './custom-table.css',
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatPaginatorModule, MatProgressSpinnerModule, MatMenuModule, MatSortModule, MatExpansionModule],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class CustomTable implements OnDestroy, OnChanges, AfterViewInit {
  // Inputs
  @Input() columns: { columnDef: string; header: string; cell?: (element: any) => string; cssClass?: string; }[] = [];
  @Input() objects: any[] = [];
  @Input() dataSource = new MatTableDataSource<any>();
  @Input() isLoading = true;
  @Input() availableActions: string[] = [];
  @Input() expandableRows = false;
  @Input() expandedElement: any = null;

  // Outputs
  @Output() openForm = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() fileSelected = new EventEmitter<any>();
  @Output() export = new EventEmitter<any>();
  @Output() rowToggle = new EventEmitter<any>();
  @Output() toggleExpand = new EventEmitter<any>();

  onToggleExpand(element: any, event: Event) {
    event.stopPropagation();
    this.expandedElement = this.expandedElement === element ? null : element;
    this.toggleExpand.emit(this.expandedElement);
    this.cdRef.detectChanges();
  }

  get displayedColumns(): string[] {
    const baseColumns = this.expandableRows ? ['expand'] : [];
    baseColumns.push(...this.columns.map(col => col.columnDef));
    if (this.availableActions.includes('edit') || this.availableActions.includes('delete')) {
      baseColumns.push('actions');
    }
    return baseColumns;
  }

  get expandedColumns(): string[] {
    return ['expandedDetail'];
  }

  isExpandedRow = (index: number, row: any) => row.hasOwnProperty('expandedDetail');

  isBaseRow = (index: number, row: any) => !row.hasOwnProperty('expandedDetail');

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
