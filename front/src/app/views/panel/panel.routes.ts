import { Routes } from '@angular/router';

import { PanelLayoutComponent } from '../../shared/components/panel-layout/panel-layout.component';
import { PanelInicioComponent } from './panel-inicio.component';
import { PanelConfiguracionComponent } from './panel-configuracion.component';

export const PANEL_ROUTES: Routes = [
  {
    path: '',
    component: PanelLayoutComponent,
    children: [
      { path: '', component: PanelInicioComponent },
      { path: 'clientes', component: PanelInicioComponent },
      { path: 'servicios', component: PanelInicioComponent },
      { path: 'configuracion', component: PanelConfiguracionComponent },
    ],
  },
];
