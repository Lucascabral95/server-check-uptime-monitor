// Enums replicados desde el backend para usar en el frontend
// No importar desde @prisma/client en componentes de Next.js

export enum Status {
  UP = 'UP',
  DOWN = 'DOWN',
  PENDING = 'PENDING',
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}
