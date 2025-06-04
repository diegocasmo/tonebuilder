import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { z } from 'zod';
import { createZodError } from '@/lib/utils/form';

type PrismaErrorMapping = {
  [key: string]: (error: PrismaClientKnownRequestError) => z.ZodError;
};

const defaultPrismaErrorMapping: PrismaErrorMapping = {
  P2002: (error) => {
    const field = (error.meta?.target as string[])?.[0] || 'unknown';
    return createZodError(`A record with this ${field} already exists`, [
      field,
    ]);
  },
};

export function transformPrismaErrorToZodError(
  error: unknown
): z.ZodError | null {
  if (error instanceof PrismaClientKnownRequestError) {
    const errorHandler = defaultPrismaErrorMapping[error.code];
    return errorHandler ? errorHandler(error) : null;
  }
  return null;
}
