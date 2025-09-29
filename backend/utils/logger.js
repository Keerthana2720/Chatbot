const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!require('fs').existsSync(logDir)) {
  require('fs').mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'ai-chatbot-backend' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat
    }),
    
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ]
});

// Add custom methods for different log levels
logger.audit = (message, meta = {}) => {
  logger.info(`AUDIT: ${message}`, { ...meta, type: 'audit' });
};

logger.security = (message, meta = {}) => {
  logger.warn(`SECURITY: ${message}`, { ...meta, type: 'security' });
};

logger.performance = (message, meta = {}) => {
  logger.info(`PERFORMANCE: ${message}`, { ...meta, type: 'performance' });
};

// Log API requests
logger.apiRequest = (req, res, responseTime) => {
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });
};

// Log database operations
logger.dbOperation = (operation, table, duration, meta = {}) => {
  logger.debug(`DB ${operation}`, {
    table,
    duration: `${duration}ms`,
    ...meta
  });
};

// Log authentication events
logger.auth = (event, userId, meta = {}) => {
  logger.info(`AUTH ${event}`, {
    userId,
    ...meta
  });
};

// Log AI operations
logger.ai = (operation, model, tokens, duration, meta = {}) => {
  logger.info(`AI ${operation}`, {
    model,
    tokens,
    duration: `${duration}ms`,
    ...meta
  });
};

module.exports = logger;
