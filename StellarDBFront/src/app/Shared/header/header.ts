import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/Auth/auth.service';
import { IconService } from '../../Services/Icon/icon.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeToggleSwitchComponent } from '../theme-toggle-switch/theme-toggle-switch';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ThemeToggleSwitchComponent
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private iconService: IconService,
    private router: Router,) { }

  shouldShowHeader(): boolean {
    return this.router.url !== '/Login'; // Hide header on login page
  }

  async onLogout(): Promise<void> {
    try {
      await firstValueFrom(this.authService.logout());
      await this.router.navigate(["/Login"]);      
    } catch (error) {
      console.error('Logout error:', error);
      await this.router.navigate(["/Login"]);
    }
  }
}
