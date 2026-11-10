import { z } from 'zod';

export const registerSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
  email: z.string().trim().toLowerCase().max(150).pipe(z.email('Correo electrónico inválido.')),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    // bcrypt ignora todo lo que pase de 72 bytes.
    .refine((v) => Buffer.byteLength(v, 'utf8') <= 72, 'La contraseña es demasiado larga (máx. 72 bytes).')
    .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), 'La contraseña debe incluir letras y números.'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'El correo es obligatorio.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
