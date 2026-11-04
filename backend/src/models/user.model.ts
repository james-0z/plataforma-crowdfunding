export interface User {
  id: number;
  nombre: string;
  email: string;
  password_hash?: string;
  rol: 'user' | 'admin';
  creado_en?: Date;
}

export interface UserDTO {
  nombre: string;
  email: string;
  password?: string;
}