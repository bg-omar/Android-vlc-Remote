import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { Fluidflow } from './fluidflow';
import { fluidflowRoutingModule } from './fluidflow-routing.module';
import {RouterModule, Routes} from "@angular/router";
import {FormsModule} from "@angular/forms";


const routes: Routes = [
  {
    path: '',
    component: Fluidflow
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    IonicModule,
    CommonModule,
    IonicModule,
    fluidflowRoutingModule,
    Fluidflow
  ],
  declarations: [  ],
  exports: [RouterModule]
})
export class FluidflowModule { }
