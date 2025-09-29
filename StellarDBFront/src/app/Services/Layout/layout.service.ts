import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
export interface LayoutConfig {
  showHeader: boolean;
  showSidebar: boolean;
  sidebarType?: 'admin' | 'navigation' | null;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private layoutConfigSubject = new BehaviorSubject<LayoutConfig>({
    showHeader: true,
    showSidebar: false,
    sidebarType: null
  });

  public layoutConfig$: Observable<LayoutConfig> = this.layoutConfigSubject.asObservable();
  constructor(private router: Router) {
    // Listen to route changes and update layout accordingly
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => (event as NavigationEnd).url)
      )
      .subscribe(url => {
        this.updateLayoutForRoute(url);
      });
  }

  private updateLayoutForRoute(url: string): void {
    const config: LayoutConfig = this.getLayoutConfigForRoute(url);
    this.layoutConfigSubject.next(config);
  }

  private getLayoutConfigForRoute(url: string): LayoutConfig {
    // Remove query parameters and fragments for matching
    const cleanUrl = url.split('?')[0].split('#')[0];

    // Routes that should not show header
    const noHeaderRoutes = ['/Login', '/Register'];

    // Routes that should show admin sidebar
    const adminSidebarRoutes = ['/Dashboard'];

    // Routes that should show navigation sidebar
    const navigationSidebarRoutes = [
      '/Home', '/Star', '/StellarObjectsTypes', '/StarSpectralClasses',
      '/StarLuminosityClasses', '/Planet', '/PlanetTypes',
      '/ChemicalElements', '/AtmosphericGases'
    ];

    const showHeader = !noHeaderRoutes.includes(cleanUrl);
    const showAdminSidebar = adminSidebarRoutes.includes(cleanUrl);
    const showNavigationSidebar = navigationSidebarRoutes.includes(cleanUrl);
    return {
      showHeader,
      showSidebar: showAdminSidebar || showNavigationSidebar,
      sidebarType: showAdminSidebar ? 'admin' : (showNavigationSidebar ? 'navigation' : null)
    };
  }

  // Allow manual override of layout config
  public setLayoutConfig(config: Partial<LayoutConfig>): void {
    const currentConfig = this.layoutConfigSubject.value;
    this.layoutConfigSubject.next({ ...currentConfig, ...config });
  }
}
