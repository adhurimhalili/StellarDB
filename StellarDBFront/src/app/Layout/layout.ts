import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutService, LayoutConfig } from '../Services/Layout/layout.service';
import { HeaderComponent } from '../Shared/header/header';
import { FooterComponent } from '../Shared/footer/footer';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent implements OnInit, OnDestroy {
  layoutConfig: LayoutConfig = {
    showHeader: true,
    showSidebar: false,
    sidebarType: null
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
