# Prisma Error Handling System

Sistema robusto y profesional para el manejo de errores de Prisma en NestJS.

## 📁 Archivos

- [`handler-prisma-error.ts`](./handler-prisma-error.ts) - Funciones principales de manejo de errores
- [`prisma.exception-filter.ts`](./prisma.exception-filter.ts) - Filtro global de excepciones
- [`index.ts`](./index.ts) - Exportaciones centralizadas

## 🚀 Características

### 1. Tipado Seguro
- Type guards para validar errores de Prisma
- Interfaz `PrismaErrorExtended` con metadata completa
- Tipado `unknown` en lugar de `any`

### 2. Cobertura Completa de Códigos de Error

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| P2025 | Registro no encontrado | 404 Not Found |
| P2002 | Violación de restricción única | 409 Conflict |
| P2003 | Violación de clave foránea | 400 Bad Request |
| P2014 | Violación de relación requerida | 400 Bad Request |
| P2018 | Registro relacionado no encontrado | 400 Bad Request |
| P2009 | Error de validación de query | 400 Bad Request |
| P2004 | Violación de restricción NULL | 400 Bad Request |
| P2006 | Valor inválido para campo | 400 Bad Request |
| P2007 | Error de validación de datos | 400 Bad Request |
| P2005 | Error de interpretación de query | 400 Bad Request |
| P2024 | Timeout de conexión | 503 Service Unavailable |
| P2034 | Conflicto de transacción | 409 Conflict |

### 3. Logging Integrado
- Todos los errores se registran con contexto completo
- Incluye ID de entidad cuando está disponible
- Stack traces para debugging

### 4. Respuestas HTTP Consistentes

```typescript
{
  "statusCode": 404,
  "message": "User with ID '123' not found",
  "error": "Not Found",
  "timestamp": "2024-01-17T10:30:00.000Z",
  "path": "/api/v1/users/123",
  "details": { ... }
}
```

## 📖 Uso

El filtro global ya está configurado en [`main.ts`](../main.ts). Los errores de Prisma se manejan automáticamente:

```typescript
@Injectable()
export class UserService {
  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }
}
```

### Manejo Manual (Opcional)

```typescript
import { handlePrismaError } from './errors';

try {
  return await this.prisma.user.findUnique({ where: { id } });
} catch (error) {
  handlePrismaError(error, 'User', id);
}
```

### Utilidad handlePrismaOperation

```typescript
import { handlePrismaOperation } from './errors';

return handlePrismaOperation(
  () => this.prisma.monitor.findUnique({ where: { id } }),
  'Monitor',
  id,
);
```

## 📚 Referencias

- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
