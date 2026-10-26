import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

export interface UserInput {
  nombre: string;
  email: string;
  password: string;
}

export const authService = {
  async register(data: UserInput) {
    const { nombre, email, password } = data;

    // 1. Verificar si el usuario ya existe
    const userExist = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    // 2. Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Insertar usuario en la base de datos
    const query = `
      INSERT INTO usuarios (nombre, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, nombre, email, rol, creado_en;
    `;
    const values = [nombre, email, passwordHash];
    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    // 4. Generar Token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, rol: newUser.rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user: newUser, token };
  },

  async login(email: string, password: string) {
    // 1. Buscar usuario por email
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      throw new Error('Credenciales inválidas.');
    }

    const user = result.rows[0];

    // 2. Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas.');
    }

    // 3. Generar Token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Ocultar password_hash antes de retornar
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }
};