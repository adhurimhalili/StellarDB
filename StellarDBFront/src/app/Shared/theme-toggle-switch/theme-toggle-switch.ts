import { Component } from '@angular/core';
import { ThemeSwitcherService } from '../../Services/ThemeSwitcher/theme-switcher-service';

@Component({
  selector: 'app-theme-toggle-switch',
  standalone: false,
  //imports: [],
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
