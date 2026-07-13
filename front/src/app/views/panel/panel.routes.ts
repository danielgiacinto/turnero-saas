import { Routes } from '@angular/router';

import { adminGuard } from '../../core/guards/admin.guard';
import { suscripcionGuard } from '../../core/guards/suscripcion.guard';
import { PanelLayoutComponent } from '../../shared/components/panel-layout/panel-layout.component';
import { PanelInicioComponent } from './panel-inicio.component';
import { PanelSuscripcionComponent } from './panel-suscripcion.component';
import { PanelConfiguracionComponent } from './configuracion/panel-configuracion.component';
import { ConfiguracionAparienciaComponent } from './configuracion/apariencia/apariencia.component';
import { ConfiguracionDatosComercioComponent } from './configuracion/datos-comercio/datos-comercio.component';
import { PanelProfesionalesComponent } from './profesionales/profesionales.component';
import { PanelServiciosComponent } from './servicios/servicios.component';
import { PanelHorariosComponent } from './horarios/horarios.component';
import { PanelAgendaComponent } from './agenda/agenda.component';

export const PANEL_ROUTES: Routes = [
  {
    path: '',
    component: PanelLayoutComponent,
    children: [
      { path: 'suscripcion', component: PanelSuscripcionComponent },
      {
        path: '',
        canActivate: [suscripcionGuard],
        children: [
          { path: '', component: PanelAgendaComponent },
          { path: 'clientes', component: PanelInicioComponent },
          { path: 'servicios', component: PanelServiciosComponent },
          { path: 'horarios', component: PanelHorariosComponent },
          {
            path: 'profesionales',
            canActivate: [adminGuard],
            component: PanelProfesionalesComponent,
          },
        ],
      },
      { path: 'configuracion', component: PanelConfiguracionComponent },
      { path: 'configuracion/apariencia', component: ConfiguracionAparienciaComponent },
      {
        path: 'configuracion/datos-comercio',
        canActivate: [adminGuard],
        component: ConfiguracionDatosComercioComponent,
      },
    ],
  },
];
