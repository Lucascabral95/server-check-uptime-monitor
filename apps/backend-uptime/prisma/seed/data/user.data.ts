import { Role } from '@prisma/client';

export const SEED_USERS = [
  {
    id: 'dbbbdc7b-f903-4037-a810-aab4d8f1db19',
    cognitoSub: '145854c8-4081-704f-ca5d-b06ba2d92b75',
    email: 'edgardolucesss@gmail.com',
    role: Role.ADMIN,
  },
  {
    id: '82ca676f-034a-4b9a-bf51-fa4ceccbae19',
    cognitoSub: 'd4a80438-d031-7027-fd40-2e4cff7ac0a3',
    email: 'lucasgamerpolar10@gmail.com',
    role: Role.USER,
  },
] as const;

export const ADMIN_USER = SEED_USERS[0];
export const REGULAR_USER = SEED_USERS[1];