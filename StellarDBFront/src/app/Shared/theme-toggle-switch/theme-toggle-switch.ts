import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeSwitcherService } from '../../Services/ThemeSwitcher/theme-switcher-service';

@Component({
  selector: 'app-theme-toggle-switch',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './theme-toggle-switch.html',
  styleUrl: './theme-toggle-switch.css'
})
export class ThemeToggleSwitchComponent {
  constructor(public theme: ThemeSwitcherService) { }

  toggleTheme() {
    this.theme.toggleTheme();
  }

  get isDark() {
    return this.theme.isDark();
  }
}
