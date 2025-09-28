import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  imports: [MatIconModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly github = 'https://github.com/adhurimhalili/StellarDB';
  readonly twitter = 'https://x.com/'
}
