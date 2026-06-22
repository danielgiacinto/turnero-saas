import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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
  return `${etiqueta} no es válido.`;
}
