import type { Response } from 'express';

export type PaginationMeta = {
  nextCursor?: string | null;
  hasMore: boolean;
  total?: number;
  limit?: number;
  skip?: number;
};

export type SuccessMeta = {
  requestId?: string;
  pagination?: PaginationMeta;
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Omit<SuccessMeta, 'requestId'>,
) {
  const requestId = res.locals.requestId as string | undefined;
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      requestId,
      ...meta,
    },
  });
}
