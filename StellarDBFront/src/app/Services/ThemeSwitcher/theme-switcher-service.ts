// theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeSwitcherService {
  private readonly storageKey = 'user-theme';
  private darkThemeClasses = ['dark-theme', 'dark'];

  toggleTheme() {
    const isDark = this.isDark();
    const newTheme = isDark ? 'light' : 'dark';
    this.darkThemeClasses.forEach(cls => {
      document.body.classList.toggle(cls, !isDark);
    });
    localStorage.setItem(this.storageKey, newTheme);
  }

  isDark(): boolean {
    const storedTheme = localStorage.getItem(this.storageKey);
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    // Default: check body class or default to light
    return this.darkThemeClasses.every(cls => document.body.classList.contains(cls));
  }

  // Optionally, call this on app init to apply stored theme
  applyStoredTheme() {
    const storedTheme = localStorage.getItem(this.storageKey);
    const shouldBeDark = storedTheme === 'dark';
    this.darkThemeClasses.forEach(cls => {
      document.body.classList.toggle(cls, shouldBeDark);
    });
  }
}
