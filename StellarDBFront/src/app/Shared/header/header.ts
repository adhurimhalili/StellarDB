import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/Auth/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  constructor(
    public authService: AuthService,
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
