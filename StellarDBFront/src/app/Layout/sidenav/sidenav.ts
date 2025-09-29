import { Component, AfterViewInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Services/Auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion'
import { Pipe, PipeTransform } from '@angular/core';

export interface MenuItem {
  label: string;
  route?: string;
  icon?: string;
  children?: MenuItem[];
}

export const DASHBOARD_MENUS: MenuItem[] = [
  {
    label: 'Data Forms',
    children: [
      {
        label: 'Stars', icon: 'star', children: [
          { label: 'List', route: '/Star', icon: 'star' },
          { label: 'Constellations', route: '/Constellations', icon: 'circles_ext' },
          { label: 'Spectral Classes', route: '/StarSpectralClasses', icon: 'brightness_6' },
          { label: 'Luminosity Classes', route: '/StarLuminosityClasses', icon: 'tonality_2' },
        ]
      },
      {
        label: 'Planets', icon: 'public', children: [
          { label: 'List', route: '/Planet', icon: 'planet' },
          { label: 'Planet Types', route: '/PlanetTypes', icon: 'circles' },
        ]
      },
      { label: 'Moons', route: '/Moon', icon: 'moon_stars' },
      { label: 'Chemical Elements', route: '/ChemicalElements', icon: 'landslide' },
      { label: 'Atmospheric Gases', route: '/PlanAtmosphericGaseset', icon: 'air' },
    ]
  },
  {
    label: 'Identity',
    children: [
      { label: 'Users', route: '/Users', icon: 'person' },
      { label: 'Roles', route: '/Roles', icon: 'security' }
    ]
  },
  {
    label: 'Administration',
    children: [
      { label: 'AuditLog', route: '/AuditLogs', icon: 'history' }
    ]
  }
];

@Pipe({ name: 'menuName' })
export class MenuNamePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  }
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterModule, CommonModule, MatSidenavModule, MatListModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MenuNamePipe, MatExpansionModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.css'
})
export class SidenavComponent implements AfterViewInit {
  private readonly authService = inject(AuthService);
  private readonly token = this.authService.getToken();
  dashboardMenus: MenuItem[] = [];
  userRoleClaims: string[] = [];

  constructor() {
    this.userRoleClaims = this.authService.getRoleClaims();
    this.filterMenusByUserClaims();
  }

  ngAfterViewInit(): void {
    // Any initialization that requires the view to be fully loaded can go here
  }


  private filterMenusByUserClaims(): void {
    // Filter menus based on user claims
    this.dashboardMenus = DASHBOARD_MENUS.filter(menu => {
      if (menu.label === 'Data Forms') {
        return this.userRoleClaims.includes('ReadAccess');
      } else if (menu.label === 'Identity') {
        return this.userRoleClaims.includes('IdentityAccess');
      } else if (menu.label === 'Administration') {
        return this.userRoleClaims.includes('AdminAccess');
      }
      return false; // Hide any other menus by default
    });
  }
}
