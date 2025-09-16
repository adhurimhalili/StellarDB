import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './Views/login/login';
import { RegisterComponent } from './Views/register/register';
import { Home } from './Views/home/home';
import { StellarObjectTypesService } from './Views/stellar-object-types/stellar-object-types';
import { StarSpectralClassesComponent } from './Views/star-spectral-classes/star-spectral-classes';
import { StarComponent } from './Views/star/star';
import { StarLuminosityClassesComponent } from './Views/star-luminosity-classes/star-luminosity-classes';
import { PlanetTypesComponent } from './Views/planet-types/planet-types';
import { PlanetComponent } from './Views/planet/planet';
import { ChemicalElementsComponent } from './Views/chemical-elements/chemical-elements';
import { AtmosphericGasesComponent } from './Views/atmospheric-gases/atmospheric-gases';
import { RolesComponent } from './Views/Identity/roles/roles';

import { AuthGuard } from './Core/Guards/auth.guard';
import { NoAuthGuard } from './Core/Guards/noAuth.Guard';

const routes: Routes = [
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  { 
    path: 'Login', 
    component: LoginComponent,
    canActivate: [NoAuthGuard]  
  },
  { 
    path: 'Register', 
    component: RegisterComponent,
    canActivate: [NoAuthGuard]  
  },
  {
    path: 'Home',
    component: Home,
    canActivate: [AuthGuard]
  },
  {
    path: 'Star',
    component: StarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'StellarObjectsTypes',
    component: StellarObjectTypesService,
    canActivate: [AuthGuard]
  },
  {
    path: 'StarSpectralClasses',
    component: StarSpectralClassesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'StarLuminosityClasses',
    component: StarLuminosityClassesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'Planet',
    component: PlanetComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'PlanetTypes',
    component: PlanetTypesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'ChemicalElements',
    component: ChemicalElementsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'AtmosphericGases',
    component: AtmosphericGasesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'Roles',
    component: RolesComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
