export type ErrorDetails = Record<string, unknown>;

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: ErrorDetails;
  readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ErrorDetails,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function badRequest(code: string, message: string, details?: ErrorDetails) {
  return new AppError(400, code, message, details);
}

export function unauthorized(code = 'UNAUTHORIZED', message = 'Authentication required') {
  return new AppError(401, code, message);
}

export function forbidden(code = 'FORBIDDEN', message = 'You do not have access') {
  return new AppError(403, code, message);
}

export function notFound(code = 'NOT_FOUND', message = 'Resource not found') {
  return new AppError(404, code, message);
}

export function conflict(code: string, message: string, details?: ErrorDetails) {
  return new AppError(409, code, message, details);
}

export function tooManyRequests(
  code = 'RATE_LIMITED',
  message = 'Too many requests',
  details?: ErrorDetails,
) {
  return new AppError(429, code, message, details);
}

export function serviceUnavailable(
  code = 'SERVICE_UNAVAILABLE',
  message = 'Service temporarily unavailable',
  details?: ErrorDetails,
) {
  return new AppError(503, code, message, details);
}
