import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './Views/home/home';
import { StellarObjectTypesService } from './Views/stellar-object-types/stellar-object-types';
import { StarSpectralClassesComponent } from './Views/star-spectral-classes/star-spectral-classes';
import { StarComponent } from './Views/star/star';

const routes: Routes = [
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  { path: 'Home', component: Home },
  { path: 'Star', component: StarComponent },
  { path: 'StellarObjectsTypes', component: StellarObjectTypesService },
  { path: 'StarSpectralClasses', component: StarSpectralClassesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
