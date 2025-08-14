import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './Views/home/home';
import { StellarObjectTypesService } from './Views/stellar-object-types/stellar-object-types';
import { StarSpectralClassesComponent } from './Views/star-spectral-classes/star-spectral-classes';
import { StarComponent } from './Views/star/star';
import { StarLuminosityClassesComponent } from './Views/star-luminosity-classes/star-luminosity-classes';
import { PlanetTypesComponent } from './Views/planet-types/planet-types';
import { PlanetComponent } from './Views/planet/planet';
import { ChemicalElementsComponent } from './Views/chemical-elements/chemical-elements';
import { AtmosphericGasesComponent } from './Views/atmospheric-gases/atmospheric-gases';

const routes: Routes = [
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  { path: 'Home', component: Home },
  { path: 'Star', component: StarComponent },
  { path: 'StellarObjectsTypes', component: StellarObjectTypesService },
  { path: 'StarSpectralClasses', component: StarSpectralClassesComponent },
  { path: 'StarLuminosityClasses', component: StarLuminosityClassesComponent },
  { path: 'Planet', component: PlanetComponent },
  { path: 'PlanetTypes', component: PlanetTypesComponent },
  { path: 'ChemicalElements', component: ChemicalElementsComponent },
  { path: 'AtmosphericGases', component: AtmosphericGasesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
