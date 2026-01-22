import { Role } from './enums';

export interface DataUserGetDto {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
