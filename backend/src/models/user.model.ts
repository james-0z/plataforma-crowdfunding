export type Role = 'user' | 'admin';

/** Usuario tal como lo ve el cliente (nunca incluye el hash). */
export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: Role;
  creadoEn: string;
}

export interface AuthUser {
  id: number;
  email: string;
  rol: Role;
}
