import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Fluidflow } from './fluidflow';

const routes: Routes = [
  {
    path: '',
    component: Fluidflow
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class fluidflowRoutingModule { }
