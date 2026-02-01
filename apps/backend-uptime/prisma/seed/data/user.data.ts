import { Role } from '@prisma/client';

export const SEED_USERS = [
  {
    id: 'dbbbdc7b-f903-4037-a810-aab4d8f1db19',
    cognitoSub: '54485448-00b1-701c-3cb0-c10db3dc2c2e',
    email: 'edgardolucesss@gmail.com',
    role: Role.ADMIN,
  },
  {
    id: '82ca676f-034a-4b9a-bf51-fa4ceccbae19',
    cognitoSub: '745844d8-30f1-70d8-df1e-2695a6766bba',
    email: 'lucasgamerpolar10@gmail.com',
    role: Role.USER,
  },
] as const;

export const ADMIN_USER = SEED_USERS[0];
export const REGULAR_USER = SEED_USERS[1];