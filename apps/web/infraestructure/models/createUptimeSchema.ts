import { z } from 'zod';

export const createUptimeSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  url: z.string().url('Formato de URL inválido'),
  frequency: z.number().int().min(60).max(86400).optional(),
});

export type CreateUptimeSchema = z.infer<typeof createUptimeSchema>;
