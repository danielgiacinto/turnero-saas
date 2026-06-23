import { Routes } from '@angular/router';

import { adminGuard } from '../../core/guards/admin.guard';
import { PanelLayoutComponent } from '../../shared/components/panel-layout/panel-layout.component';
import { PanelInicioComponent } from './panel-inicio.component';
import { PanelConfiguracionComponent } from './panel-configuracion.component';
import { PanelProfesionalesComponent } from './panel-profesionales.component';

export const PANEL_ROUTES: Routes = [
  {
    path: '',
    component: PanelLayoutComponent,
    children: [
      { path: '', component: PanelInicioComponent },
      { path: 'clientes', component: PanelInicioComponent },
      { path: 'servicios', component: PanelInicioComponent },
      {
        path: 'profesionales',
        canActivate: [adminGuard],
        component: PanelProfesionalesComponent,
      },
      { path: 'configuracion', component: PanelConfiguracionComponent },
    ],
  },
];
