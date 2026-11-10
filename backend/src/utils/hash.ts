import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

// Hash falso para igualar el tiempo de respuesta cuando el correo no existe
// (evita revelar qué correos están registrados midiendo la demora).
export const DUMMY_HASH = bcrypt.hashSync('contraseña-inexistente', SALT_ROUNDS);
