import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutService, LayoutConfig } from '../Services/Layout/layout.service';
import { HeaderComponent } from '../Shared/header/header';
import { FooterComponent } from '../Shared/footer/footer';
import { SidenavComponent } from './sidenav/sidenav';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, MatSidenavModule, MatMenuModule, MatListModule, MatToolbarModule, MatButtonModule, MatIconModule, RouterOutlet, HeaderComponent, FooterComponent, SidenavComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent implements OnInit, OnDestroy {
  layoutConfig: LayoutConfig = {
    showHeader: true,
    showSidebar: false
  };

  private destroy$ = new Subject<void>();

  constructor(private layoutService: LayoutService) { }
  ngOnInit(): void {
    this.layoutService.layoutConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe((config: LayoutConfig) => {
        this.layoutConfig = config;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
