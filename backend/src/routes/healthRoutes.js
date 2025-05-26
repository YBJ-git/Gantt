/**
 * Health Check Routes
 * 서버 및 데이터베이스 상태 확인용 라우터
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { asyncErrorHandler } = require('../utils/errorHandler');

/**
 * 서버 기본 상태 확인
 */
router.get('/', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * 데이터베이스 연결 상태 확인
 */
router.get('/database', asyncErrorHandler(async (req, res) => {
  try {
    // 간단한 쿼리로 데이터베이스 연결 테스트
    const result = await db.execute('SELECT NOW() as current_time, VERSION() as version');
    
    // 사용자 테이블 존재 여부 확인
    let tableExists = false;
    let userCount = 0;
    
    try {
      const userCountResult = await db.execute('SELECT COUNT(*) as count FROM users');
      tableExists = true;
      userCount = userCountResult[0]?.count || 0;
    } catch (error) {
      tableExists = false;
    }
    
    res.json({
      status: 'Database connected',
      connection: {
        connected: true,
        timestamp: result[0]?.current_time,
        version: result[0]?.version
      },
      tables: {
        users_table_exists: tableExists,
        user_count: userCount
      },
      environment: {
        database_url_exists: !!process.env.DATABASE_URL,
        node_env: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'Database connection failed',
      error: error.message,
      environment: {
        database_url_exists: !!process.env.DATABASE_URL,
        node_env: process.env.NODE_ENV
      }
    });
  }
}));

/**
 * 전체 시스템 상태 확인
 */
router.get('/system', asyncErrorHandler(async (req, res) => {
  const systemInfo = {
    server: {
      status: 'running',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version
    },
    environment: {
      node_env: process.env.NODE_ENV,
      database_url_exists: !!process.env.DATABASE_URL,
      jwt_secret_exists: !!process.env.JWT_SECRET,
      port: process.env.PORT || 3000
    }
  };
  
  // 데이터베이스 상태 확인
  try {
    await db.execute('SELECT 1');
    systemInfo.database = {
      status: 'connected',
      type: 'PostgreSQL'
    };
    
    // 사용자 테이블 확인
    try {
      const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
      systemInfo.database.user_count = userCount[0]?.count || 0;
      systemInfo.database.tables_initialized = true;
    } catch {
      systemInfo.database.tables_initialized = false;
    }
    
  } catch (error) {
    systemInfo.database = {
      status: 'disconnected',
      error: error.message
    };
  }
  
  const overallStatus = systemInfo.database?.status === 'connected' ? 'healthy' : 'unhealthy';
  
  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    ...systemInfo
  });
}));

module.exports = router;
