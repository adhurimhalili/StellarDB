import { Component, signal } from '@angular/core';
import { ThemeSwitcherService } from './Services/ThemeSwitcher/theme-switcher-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('StellarDB');
  constructor(private themeSwitcher: ThemeSwitcherService) { }

  ngOnInit(): void {
    this.themeSwitcher.applyStoredTheme();
  }
}
