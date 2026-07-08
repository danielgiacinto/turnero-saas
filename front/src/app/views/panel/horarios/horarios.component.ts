import { Component, computed, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { HorariosSemanaComponent } from '../../../shared/components/horarios-semana/horarios-semana.component';

@Component({
  selector: 'app-panel-horarios',
  imports: [HorariosSemanaComponent],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.scss',
})
export class PanelHorariosComponent {
  private readonly auth = inject(AuthService);

  readonly usuarioId = computed(() => this.auth.usuario()?.id ?? null);
}
