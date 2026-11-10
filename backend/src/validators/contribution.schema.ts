import { z } from 'zod';
import { moneySchema } from './common.schema.js';

export const MIN_CONTRIBUTION = 1_000;

export const createContributionSchema = z.object({
  campanaId: z.number({ error: 'La campaña es obligatoria.' }).int().positive(),
  monto: moneySchema(MIN_CONTRIBUTION),
});

export type CreateContributionInput = z.infer<typeof createContributionSchema>;
