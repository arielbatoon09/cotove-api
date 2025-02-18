import logger from '@/utils/Logger';
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Handle cleanup on app shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle cleanup for unexpected errors
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  logger.error(`Uncaught Exception: ${error}`);
  await prisma.$disconnect();
  process.exit(1);
});

process.on('unhandledRejection', async (error) => {
  console.error('Unhandled Rejection:', error);
  logger.error(`Unhandled Rejection: ${error}`);
  await prisma.$disconnect();
  process.exit(1);
});

export default prisma;