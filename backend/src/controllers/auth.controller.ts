import { type Request, type Response } from 'express';
import { authService } from '../services/auth.service.js';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, email, password } = req.body;
      
      if (!nombre || !email || !password) {
        res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        return;
      }

      const result = await authService.register({ nombre, email, password });
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        ...result
      });
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Error en el registro' 
      });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
        return;
      }

      const result = await authService.login(email, password);
      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        ...result
      });
    } catch (error) {
      res.status(401).json({ 
        error: error instanceof Error ? error.message : 'Error en el inicio de sesión' 
      });
    }
  }
};