import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './Views/home/home';
import { StellarObjectTypesService } from './Views/stellar-object-types/stellar-object-types';

const routes: Routes = [
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  { path: 'Home', component: Home },
  { path: 'StellarObjectsTypes', component: StellarObjectTypesService },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
