import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { StellarObjectTypesForm } from './stellar-object-types-form/stellar-object-types-form';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

export interface StellarObjectTypes {
  id: string
  position: number;
  name: string;
  description: string
}

@Component({
  selector: 'app-stellar-object-types',
  standalone: true,
  templateUrl: './stellar-object-types.html',
  styleUrl: './stellar-object-types.css',
  imports: [MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatPaginatorModule, StellarObjectTypesForm],
})
export class StellarObjectTypesService implements AfterViewInit {
  displayedColumns: string[] = ['position', 'name', 'description', 'actions'];
  dataSource = new MatTableDataSource<StellarObjectTypes>();
  isLoading = true;
  readonly formDialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.fetchData();
    this.dataSource.paginator = this.paginator;
  }

  fetchData() {
    fetch('https://localhost:7271/api/StellarObjectTypes')
      .then(response => response.json())
      .then(result => {
        this.dataSource.data = result;
        this.isLoading = false;
      })
      .catch(error => {
        this.isLoading = false;
      });
  }

  form(stellarObjectId: string) {
    const dialogRef = this.formDialog.open(StellarObjectTypesForm, {
      width: '40%',
      maxWidth: '600px',
      data: { stellarObjectId }
    })

    dialogRef.afterClosed().subscribe(result => {
      this.fetchData();
    });
  }

  onDelete(stellarObjectId: string) {
    console.log('Delete clicked:', stellarObjectId);
    // TODO: Add actual delete logic here (e.g., confirmation dialog + API call)
  }

}
