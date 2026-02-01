import { Role, User } from '@prisma/client';

export const mockAdminUser: User = {
  id: 'dbbbdc7b-f903-4037-a810-aab4d8f1db19',
  cognitoSub: '54485448-00b1-701c-3cb0-c10db3dc2c2e',
  email: 'edgardolucesss@gmail.com',
  role: Role.ADMIN,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockRegularUser: User = {
  id: '82ca676f-034a-4b9a-bf51-fa4ceccbae19',
  cognitoSub: '745844d8-30f1-70d8-df1e-2695a6766bba',
  email: 'lucasgamerpolar10@gmail.com',
  role: Role.USER,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const mockUsers: User[] = [mockAdminUser, mockRegularUser];