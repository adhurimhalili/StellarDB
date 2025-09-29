import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { JwtModule } from "@auth0/angular-jwt";

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { LayoutComponent } from './Layout/layout';
import { AuthInterceptor } from './Core/Interceptors/auth.interceptor';
import { IconService } from './Services/Icon/icon.service';
import { FooterComponent } from './Shared/footer/footer';

export function tokenGetter() {
  return localStorage.getItem("auth_token"); // Changed to match your actual token key
}

@NgModule({
  declarations: [
    App,
  ],
  imports: [
    LayoutComponent,
    BrowserModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatTooltipModule,
    FooterComponent,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ["example.com"],
        disallowedRoutes: ["http://example.com/examplebadroute/"],
      },
    }),
  ],
  providers: [
    IconService,
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthInterceptor.intercept])
    )
  ],
  bootstrap: [App]
})
export class AppModule { }
