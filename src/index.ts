import 'dotenv/config';
import app from '@/app';
import { logger } from '@/config/logger';
import { checkDatabaseConnection } from '@/config/database';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      logger.error('Failed to start server: Database connection failed');
      process.exit(1);
    }

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 