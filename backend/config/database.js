const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Params: ' + e.params);
    logger.debug('Duration: ' + e.duration + 'ms');
  });
}

// Log database errors
prisma.$on('error', (e) => {
  logger.error('Database error:', e);
});

// Log database info
prisma.$on('info', (e) => {
  logger.info('Database info:', e);
});

// Log database warnings
prisma.$on('warn', (e) => {
  logger.warn('Database warning:', e);
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection verified');
    
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  prisma,
  connectDB,
  disconnectDB
};
