import { z } from 'zod';
import { isValidIsoDate } from '../utils/dates.js';

export const MAX_AMOUNT = 5_000_000_000;

const pesos = (n: number) => `$ ${n.toLocaleString('es-CO')}`;

/** Monto positivo, finito, con máximo 2 decimales. Rechaza NaN, Infinity y strings. */
export const moneySchema = (min: number) =>
  z
    .number({ error: 'Debe ser un número.' })
    .finite('Debe ser un número válido.')
    .int('El monto debe ser en pesos enteros, sin decimales.')
    .min(min, `El monto mínimo es ${pesos(min)}.`)
    .max(MAX_AMOUNT, `El monto máximo es ${pesos(MAX_AMOUNT)}.`)

export const isoDateSchema = z
  .string({ error: 'La fecha es obligatoria.' })
  .refine(isValidIsoDate, 'Fecha inválida (formato AAAA-MM-DD).');

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive('Identificador inválido.'),
});
