/**
 * Configuration
 * 애플리케이션 설정 파일
 */
require('dotenv').config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'gantt_chart_db',
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    waitForConnections: true,
    queueLimit: 0,
    charset: 'utf8mb4'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: process.env.CACHE_TTL || 300
  },
  
  optimization: {
    workerCount: process.env.OPTIMIZATION_WORKER_COUNT || 2,
    maxWorkloadPerResource: process.env.MAX_WORKLOAD_PER_RESOURCE || 8
  }
};