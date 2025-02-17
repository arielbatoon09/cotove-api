import { blue, red, yellow, green, cyan, white } from 'colorette';

type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG' | 'SUCCESS';

const levels: Record<LogLevel, (text: string) => string> = {
  INFO: cyan,
  ERROR: red,
  WARN: yellow,
  DEBUG: blue,
  SUCCESS: green,
};

function getTimestamp(): string {
  return new Date().toISOString();
}

const logger = {
  log: (level: LogLevel, message: string): void => {
    const color = levels[level] || white;
    console.log(`[${color(level)}] [${getTimestamp()}] : ${message}`);
  },
  info: (message: string): void => logger.log('INFO', message),
  error: (message: string): void => logger.log('ERROR', message),
  warn: (message: string): void => logger.log('WARN', message),
  debug: (message: string): void => logger.log('DEBUG', message),
  success: (message: string): void => logger.log('SUCCESS', message),
};

export default logger;
