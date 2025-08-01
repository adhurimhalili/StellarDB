// theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeSwitcherService {
  private darkMode = false;

  isDark(): boolean {
    return this.darkMode;
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;

    const html = document.documentElement;

    if (this.darkMode) {
      html.classList.add('dark', 'dark-theme');
      html.classList.remove('light', 'light-theme');
    } else {
      html.classList.remove('dark', 'dark-theme');
      html.classList.add('light', 'light-theme');
    }
  }
}
