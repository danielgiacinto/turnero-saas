import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Contenedor centrado para las pantallas de autenticación staff. */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {}
