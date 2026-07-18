import pino from 'pino';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LoggerOptions {
  name?: string;
  level?: LogLevel;
  pretty?: boolean;
}

export function createLogger(options: LoggerOptions = {}): pino.Logger {
  const { name = 'soloadvertiser', level = 'info', pretty } = options;

  const isPretty = pretty ?? process.env['NODE_ENV'] !== 'production';

  return pino({
    name,
    level,
    ...(isPretty
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        }
      : {}),
  });
}

export const logger = createLogger();
export default logger;
