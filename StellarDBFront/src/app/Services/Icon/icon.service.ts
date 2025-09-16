// icon.service.ts
// Service for managing icons in the application
import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private icons: Map<string, string> = new Map();

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    // Register the default icon
    this.matIconRegistry.addSvgIcon(
      'planet-svgrepo', // Name of the icon
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/planet-svgrepo.svg') // Path to the SVG file A:\Repos\StellarDB\StellarDBFront\src\assets\icons\planet-svgrepo.svg
    );
  }

  /**
   * Registers a new icon with a given name and SVG content.
   * @param name The name of the icon.
   * @param svg The SVG string for the icon.
   */
  registerIcon(name: string, svg: string): void {
    this.icons.set(name, svg);
  }

  /**
   * Retrieves the SVG content for a registered icon.
   * @param name The name of the icon.
   * @returns The SVG string, or undefined if not found.
   */
  getIcon(name: string): string | undefined {
    return this.icons.get(name);
  }

  /**
   * Checks if an icon is registered.
   * @param name The name of the icon.
   * @returns True if the icon exists, false otherwise.
   */
  hasIcon(name: string): boolean {
    return this.icons.has(name);
  }

  /**
   * Removes a registered icon.
   * @param name The name of the icon.
   */
  removeIcon(name: string): void {
    this.icons.delete(name);
  }
}
