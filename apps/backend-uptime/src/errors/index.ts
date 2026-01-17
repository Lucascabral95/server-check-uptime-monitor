/**
 * Centralized error handling for Prisma operations
 */

export {
  handlePrismaError,
  handlePrismaOperation,
  getEntityNameFromModel,
  PRISMA_ERROR_CODES,
} from './handler-prisma-error';

export { PrismaExceptionFilter } from './prisma.exception-filter';
