import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';

interface PrismaErrorMetadata {
  target?: string[];
  field_name?: string;
  relation?: string;
  model?: string;
}

interface PrismaErrorExtended extends Error {
  code: string;
  meta?: PrismaErrorMetadata;
  clientVersion?: string;
}

function isPrismaError(error: unknown): error is PrismaErrorExtended {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as PrismaErrorExtended).code === 'string'
  );
}

function formatTargetFields(target: unknown): string {
  if (!target || !Array.isArray(target)) {
    return '';
  }
  return ` (${target.join(', ')})`;
}

function getFieldName(meta: PrismaErrorMetadata | undefined): string {
  if (!meta) {
    return '';
  }
  return meta.field_name || meta.target?.[0] || '';
}

export function handlePrismaError(
  error: unknown,
  entityName: string,
  id?: string,
): never {
  const logger = new Logger('PrismaErrorHandler');

  if (!isPrismaError(error)) {
    logger.error(`Non-Prisma error on ${entityName}: ${error}`);
    throw new InternalServerErrorException(
      `Unexpected error processing ${entityName}`,
    );
  }

  logger.error(
    `Prisma error on ${entityName}${id ? ` (id: ${id})` : ''}: code=${
      error.code
    }, message=${error.message}`,
  );

  const { code, meta } = error;

  switch (code) {
    case 'P2025': {
      const message = id
        ? `${entityName} with ID '${id}' not found`
        : `${entityName} not found`;
      throw new NotFoundException(message);
    }

    case 'P2002': {
      const target = formatTargetFields(meta?.target);
      throw new ConflictException(
        `A ${entityName.toLowerCase()} with this${target} value already exists`,
      );
    }

    case 'P2003': {
      const field = getFieldName(meta);
      throw new BadRequestException(
        `Invalid reference provided for field '${field}' on ${entityName}`,
      );
    }

    case 'P2014': {
      const relation = meta?.relation || 'related';
      throw new BadRequestException(
        `The change would violate the required relation '${relation}' for ${entityName}`,
      );
    }

    case 'P2018': {
      const related = meta?.relation || 'related';
      throw new BadRequestException(
        `Required ${related} record for ${entityName} was not found`,
      );
    }

    case 'P2009': {
      throw new BadRequestException(
        `Failed to validate the query for ${entityName}. Please check your input.`,
      );
    }

    case 'P2010': {
      throw new InternalServerErrorException(
        `Raw database operation failed for ${entityName}`,
      );
    }

    case 'P2004': {
      const field = getFieldName(meta);
      throw new BadRequestException(
        `Field '${field}' is required but was not provided for ${entityName}`,
      );
    }

    case 'P2006': {
      const field = getFieldName(meta);
      throw new BadRequestException(
        `Invalid value provided for field '${field}' in ${entityName}`,
      );
    }

    case 'P2007': {
      const field = getFieldName(meta);
      throw new BadRequestException(
        `Data validation error on field '${field}' for ${entityName}`,
      );
    }

    case 'P2005': {
      const field = getFieldName(meta);
      throw new BadRequestException(
        `Invalid field '${field}' in query for ${entityName}`,
      );
    }

    case 'P2024': {
      throw new InternalServerErrorException(
        'Database connection timeout. Please try again later.',
      );
    }

    case 'P2034': {
      throw new ConflictException(
        `Transaction failed due to concurrent updates on ${entityName}. Please retry.`,
      );
    }

    default: {
      logger.warn(
        `Unhandled Prisma error code '${code}' on ${entityName}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `An error occurred while processing ${entityName}`,
      );
    }
  }
}

export async function handlePrismaOperation<T>(
  operation: () => Promise<T>,
  entityName: string,
  id?: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handlePrismaError(error, entityName, id);
  }
}

export function getEntityNameFromModel(model: string): string {
  const entityMap: Record<string, string> = {
    User: 'User',
    Monitor: 'Monitor',
    PingLog: 'Ping Log',
  };

  return entityMap[model] || model;
}

export const PRISMA_ERROR_CODES = {
  RECORD_NOT_FOUND: 'P2025',
  UNIQUE_CONSTRAINT: 'P2002',
  FOREIGN_KEY_CONSTRAINT: 'P2003',
  REQUIRED_RELATION: 'P2014',
  RELATED_RECORD_NOT_FOUND: 'P2018',
  INPUT_VALIDATION: 'P2009',
  RAW_DATABASE_ERROR: 'P2010',
  NULL_CONSTRAINT: 'P2004',
  CONSTRAINT_FAILED: 'P2006',
  DATA_VALIDATION: 'P2007',
  QUERY_INTERPRETATION: 'P2005',
  CONNECTION_TIMEOUT: 'P2024',
  TRANSACTION_CONFLICT: 'P2034',
} as const;


