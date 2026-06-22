import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './auth-layout.component';
import { LoginComponent } from './login.component';
import { RegistroComponent } from './registro.component';
import { AceptarInvitacionComponent } from './aceptar-invitacion.component';
import { VerificarEmailComponent } from './verificar-email.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'registro', component: RegistroComponent },
      { path: 'verificar-email', component: VerificarEmailComponent },
      { path: 'invitacion/:token', component: AceptarInvitacionComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];
