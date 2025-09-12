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

  async onLogout(): Promise<void> {
    try {
      await firstValueFrom(this.authService.logout());
      const navigationSuccess = await this.router.navigate(["/Login"]);
      if (!navigationSuccess) {
        await this.router.navigate(["/login"]);
      }
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout request fails
      await this.router.navigate(["/Login"]);
    }
  }
}
