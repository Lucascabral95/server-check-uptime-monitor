import { z } from 'zod';

export const validateEmailSchema = z.object({
  confirmationCode: z
    .string()
    .min(1, 'El código es requerido')
    .regex(/^\d{6}$/, 'Debe ser un código de 6 dígitos'),
});

export type ValidateEmailFormData = z.infer<typeof validateEmailSchema>;
