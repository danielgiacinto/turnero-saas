import bcrypt from 'bcryptjs';

const RONDAS_SALT = 10;

export async function hashearPassword(passwordPlano: string): Promise<string> {
  return bcrypt.hash(passwordPlano, RONDAS_SALT);
}

export async function compararPassword(
  passwordPlano: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(passwordPlano, passwordHash);
}
