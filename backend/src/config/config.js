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
    // DB 연결 정보 사용
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',  // 비밀번호는 환경변수로만 제공해야 함
    database: process.env.DB_NAME || 'postgres',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  },
  
  jwt: {
    // 중요: 실제 환경에서는 반드시 환경변수를 통해 JWT_SECRET을 제공해야 합니다
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
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