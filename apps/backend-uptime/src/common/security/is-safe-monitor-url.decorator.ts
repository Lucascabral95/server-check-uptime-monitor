import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { assertSafeMonitorUrl, UnsafeUrlError } from './ssrf-guard';

/**
 * Rechaza URLs que apunten a IPs privadas/loopback/link-local (incluye el
 * metadata endpoint de cloud, 169.254.169.254) o resuelvan a una de esas IPs
 * por DNS. Complementa a @IsUrl(), que solo valida forma, no destino.
 */
export function IsSafeMonitorUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSafeMonitorUrl',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        async validate(value: unknown, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          try {
            await assertSafeMonitorUrl(value);
            return true;
          } catch (error) {
            if (error instanceof UnsafeUrlError) return false;
            throw error;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} apunta a un destino no permitido (IP privada, reservada o esquema no soportado)`;
        },
      },
    });
  };
}
