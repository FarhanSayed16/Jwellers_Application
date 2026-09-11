import { isProd } from '../config/env';

type LogFields = Record<string, unknown>;

function write(level: string, message: string, fields?: LogFields) {
  const payload = {
    level,
    msg: message,
    time: new Date().toISOString(),
    service: 'jwellers-api',
    ...fields,
  };
  const line = isProd ? JSON.stringify(payload) : `[${level}] ${message}${fields ? ` ${JSON.stringify(fields)}` : ''}`;
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, fields?: LogFields) => write('info', message, fields),
  warn: (message: string, fields?: LogFields) => write('warn', message, fields),
  error: (message: string, fields?: LogFields) => write('error', message, fields),
  debug: (message: string, fields?: LogFields) => {
    if (!isProd) write('debug', message, fields);
  },
};
