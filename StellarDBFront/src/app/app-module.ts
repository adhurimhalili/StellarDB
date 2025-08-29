import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { Header } from './Shared/header/header';
import { Home } from './Views/home/home';
import { ThemeToggleSwitchComponent } from './Shared/theme-toggle-switch/theme-toggle-switch';
//import { StellarObjectTypes } from './Views/stellar-object-types/stellar-object-types';

@NgModule({
  declarations: [
    App,
    Header,
    Home,
    ThemeToggleSwitchComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatTooltipModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations() 
  ],
  bootstrap: [App]
})
export class AppModule { }
