import { Role } from '@prisma/client';

export interface DataUserGetDto {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
