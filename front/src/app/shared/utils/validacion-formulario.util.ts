import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, catchError, first, map, of, switchMap, timer } from 'rxjs';

/** Indica si un control debe mostrarse como inválido (tras intento de envío). */
export function controlInvalido(
  control: AbstractControl | null,
  formularioEnviado: boolean,
): boolean {
  return formularioEnviado && (control?.invalid ?? false);
}

/** Valida longitud mínima solo si el campo tiene valor (campos opcionales). */
export function longitudMinimaOpcional(minimo: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = String(control.value ?? '').trim();
    if (!valor) {
      return null;
    }
    return valor.length >= minimo
      ? null
      : { minlength: { requiredLength: minimo, actualLength: valor.length } };
  };
}

/** Mensaje de error en español para validaciones comunes de Bootstrap. */
export function mensajeValidacion(control: AbstractControl | null, etiqueta: string): string {
  if (!control?.errors) {
    return '';
  }
  if (control.errors['required']) {
    return `${etiqueta} es obligatorio.`;
  }
  if (control.errors['email']) {
    return 'Ingresá un email válido.';
  }
  if (control.errors['minlength']) {
    const min = control.errors['minlength'].requiredLength;
    return `${etiqueta} debe tener al menos ${min} caracteres.`;
  }
  if (control.errors['pattern']) {
    return `${etiqueta} tiene un formato inválido.`;
  }
  if (control.errors['noDisponible']) {
    return control.errors['noDisponible'] as string;
  }
  return `${etiqueta} no es válido.`;
}

export interface DisponibilidadComercio {
  url_disponible: boolean;
  nombre_disponible: boolean;
}

/** Valida en el servidor que la URL o el nombre del comercio no estén en uso. */
export function crearValidadorDisponibilidadComercio(
  consultar: (url?: string, nombre?: string) => Observable<DisponibilidadComercio>,
  campo: 'url' | 'nombre',
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const valor = String(control.value ?? '').trim();
    if (!valor) {
      return of(null);
    }

    if (campo === 'url' && control.hasError('pattern')) {
      return of(null);
    }

    const url = campo === 'url' ? valor.toLowerCase() : undefined;
    const nombre = campo === 'nombre' ? valor : undefined;

    return timer(400).pipe(
      switchMap(() => consultar(url, nombre)),
      map((res) => {
        const disponible = campo === 'url' ? res.url_disponible : res.nombre_disponible;
        if (disponible) {
          return null;
        }
        return {
          noDisponible:
            campo === 'url'
              ? 'Ya existe esta dirección. Ingresá otra, por favor.'
              : 'Ya existe un comercio registrado con ese nombre. Elegí otro.',
        };
      }),
      catchError(() => of(null)),
      first(),
    );
  };
}
