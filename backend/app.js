/**
 * 데이터베이스 연결 Express 서버 - PostgreSQL 연동
 */
const express = require('express');
const cors = require('cors');
const db = require('./database/connection');

const app = express();

// 기본 미들웨어
app.use(express.json());
app.use(cors({
  origin: ['https://tubular-vacherin-352fde.netlify.app', 'http://localhost:3000'],
  credentials: true
}));

// 데이터베이스 초기화 (필요시)
const initializeDatabase = async () => {
  try {
    const connection = await db.checkConnection();
    console.log('📊 데이터베이스 연결 상태:', connection);
    
    if (connection.status === 'connected') {
      // 데이터베이스 통계 확인
      const stats = await db.getStats();
      console.log('📈 데이터베이스 통계:', stats);
      
      // 테이블이 없으면 초기화
      if (stats.totalTables === 0) {
        console.log('🏗️ 빈 데이터베이스 감지 - 초기화 시작');
        await db.initDatabase();
      }
    }
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 오류:', error);
  }
};

// 서버 시작 시 데이터베이스 초기화
initializeDatabase();

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: '간트 차트 시스템 백엔드 실행 중 (PostgreSQL 연동)',
    timestamp: new Date(),
    version: '2.0.0'
  });
});

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running with PostgreSQL',
    timestamp: new Date()
  });
});

// API 기본 상태
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'API 정상 작동 (PostgreSQL 연동)',
    timestamp: new Date(),
    database: 'PostgreSQL',
    endpoints: [
      'GET /',
      'GET /health', 
      'GET /api/status',
      'POST /api/users/login',
      'GET /api/users/me',
      'GET /api/users',
      'GET /api/dashboard/data',
      'GET /api/roles',
      'GET /api/notifications',
      'GET /api/tasks',
      'GET /api/resources'
    ]
  });
});

// 데이터베이스 상태 확인 API
app.get('/api/health/database', async (req, res) => {
  try {
    const connection = await db.checkConnection();
    const stats = await db.getStats();
    
    res.json({
      status: connection.status,
      timestamp: connection.timestamp,
      version: connection.version,
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// 시스템 상태 확인 API
app.get('/api/health/system', async (req, res) => {
  try {
    const dbConnection = await db.checkConnection();
    
    res.json({
      status: 'healthy',
      server: {
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node_version: process.version
      },
      database: {
        status: dbConnection.status,
        type: 'PostgreSQL',
        connected: dbConnection.status === 'connected'
      },
      environment: {
        node_env: process.env.NODE_ENV || 'production',
        database_url_exists: !!process.env.DATABASE_URL,
        port: process.env.PORT || 3000
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'System health check failed',
      error: error.message
    });
  }
});

// 로그인 엔드포인트
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 로그인 시도:', { username, timestamp: new Date() });
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '사용자명과 비밀번호를 입력해주세요.'
      });
    }
    
    // 데이터베이스에서 사용자 조회
    const userQuery = `
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.username = $1 AND u.password_hash = $2 AND u.status = 'active'
    `;
    
    const user = await db.queryRow(userQuery, [username, password]);
    
    if (!user) {
      console.log('❌ 로그인 실패:', { username, reason: 'invalid_credentials' });
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 마지막 로그인 시간 업데이트
    await db.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    
    // 간단한 토큰 생성
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    
    console.log('✅ 로그인 성공:', { username, role: user.role_name, userId: user.id });
    
    res.json({
      success: true,
      message: '로그인 성공',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role_name || 'user',
        department: user.department,
        position: user.position
      }
    });
    
  } catch (error) {
    console.error('❌ 로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 사용자 정보 조회
app.get('/api/users/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }
    
    // 토큰에서 사용자명 추출
    const token = authHeader.split(' ')[1];
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    const [username] = decodedToken.split(':');
    
    // 데이터베이스에서 사용자 정보 조회
    const userQuery = `
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.username = $1 AND u.status = 'active'
    `;
    
    const user = await db.queryRow(userQuery, [username]);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role_name || 'user',
        department: user.department,
        position: user.position,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ 사용자 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 정보 조회 중 오류가 발생했습니다.'
    });
  }
});

// 모든 사용자 조회 (관리자용)
app.get('/api/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }
    
    const usersQuery = `
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
             u.department, u.position, u.status, u.created_at,
             r.name as role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      ORDER BY u.created_at DESC
    `;
    
    const users = await db.queryRows(usersQuery);
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role_name || 'user',
        department: user.department,
        position: user.position,
        status: user.status,
        createdAt: user.created_at
      }))
    });
    
  } catch (error) {
    console.error('❌ 사용자 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 대시보드 데이터 API
app.get('/api/dashboard/data', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }

    // 전체 통계 조회
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM resources WHERE status = 'active') as resources_count,
        (SELECT COUNT(*) FROM tasks WHERE status != 'completed') as active_tasks_count,
        (SELECT COUNT(*) FROM tasks WHERE status = 'overdue' OR end_date < CURRENT_DATE) as overdue_tasks_count,
        (SELECT COUNT(*) FROM tasks WHERE end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days') as upcoming_deadlines_count
    `;
    
    const stats = await db.queryRow(statsQuery);
    
    // 가장 부하가 높은 리소스들
    const highLoadResourcesQuery = `
      SELECT r.id, r.name, r.department, r.capacity_hours,
             COALESCE(ra.total_allocated, 0) as current_load,
             ROUND((COALESCE(ra.total_allocated, 0)::float / r.capacity_hours * 100), 2) as utilization
      FROM resources r
      LEFT JOIN (
        SELECT resource_id, SUM(allocated_hours) as total_allocated
        FROM resource_assignments ra
        JOIN tasks t ON ra.task_id = t.id
        WHERE t.status IN ('pending', 'in_progress')
        GROUP BY resource_id
      ) ra ON r.id = ra.resource_id
      WHERE r.status = 'active'
      ORDER BY utilization DESC NULLS LAST
      LIMIT 3
    `;
    
    const highLoadResources = await db.queryRows(highLoadResourcesQuery);
    
    // 부하가 낮은 리소스들
    const lowLoadResourcesQuery = `
      SELECT r.id, r.name, r.department, r.capacity_hours,
             COALESCE(ra.total_allocated, 0) as current_load,
             ROUND((COALESCE(ra.total_allocated, 0)::float / r.capacity_hours * 100), 2) as utilization
      FROM resources r
      LEFT JOIN (
        SELECT resource_id, SUM(allocated_hours) as total_allocated
        FROM resource_assignments ra
        JOIN tasks t ON ra.task_id = t.id
        WHERE t.status IN ('pending', 'in_progress')
        GROUP BY resource_id
      ) ra ON r.id = ra.resource_id
      WHERE r.status = 'active'
      ORDER BY utilization ASC NULLS FIRST
      LIMIT 3
    `;
    
    const lowLoadResources = await db.queryRows(lowLoadResourcesQuery);
    
    // 다가오는 마감일
    const upcomingDeadlinesQuery = `
      SELECT t.id, t.name, t.end_date as deadline, t.priority,
             r.name as resource_name
      FROM tasks t
      LEFT JOIN resources r ON t.assigned_to = r.id
      WHERE t.status IN ('pending', 'in_progress') 
        AND t.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '14 days'
      ORDER BY t.end_date ASC
      LIMIT 5
    `;
    
    const upcomingDeadlines = await db.queryRows(upcomingDeadlinesQuery);
    
    // 최근 알림 (최적화 관련)
    const recentOptimizationsQuery = `
      SELECT id, title as description, created_at as timestamp
      FROM notifications
      WHERE type = 'optimization'
      ORDER BY created_at DESC
      LIMIT 3
    `;
    
    const recentOptimizations = await db.queryRows(recentOptimizationsQuery);
    
    // 전체 부하율 계산
    const totalCapacity = highLoadResources.concat(lowLoadResources)
      .reduce((sum, r) => sum + r.capacity_hours, 0);
    const totalAllocated = highLoadResources.concat(lowLoadResources)
      .reduce((sum, r) => sum + r.current_load, 0);
    const overallLoad = totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        overallLoad: overallLoad,
        resourcesCount: stats.resources_count || 0,
        tasksCount: stats.active_tasks_count || 0,
        criticalTasks: highLoadResources.filter(r => r.utilization > 90).length,
        overdueTasksCount: stats.overdue_tasks_count || 0,
        upcomingDeadlinesCount: stats.upcoming_deadlines_count || 0,
        mostLoadedResources: highLoadResources.map(r => ({
          id: r.id,
          name: r.name,
          utilization: Math.round(r.utilization || 0),
          capacity: r.capacity_hours,
          department: r.department
        })),
        leastLoadedResources: lowLoadResources.map(r => ({
          id: r.id,
          name: r.name,
          utilization: Math.round(r.utilization || 0),
          capacity: r.capacity_hours,
          department: r.department
        })),
        recentOptimizations: recentOptimizations.map(opt => ({
          id: opt.id,
          timestamp: opt.timestamp,
          description: opt.description
        })),
        upcomingDeadlines: upcomingDeadlines.map(task => ({
          id: task.id,
          name: task.name,
          resourceName: task.resource_name || '미할당',
          deadline: task.deadline,
          priority: task.priority
        })),
        heatmapData: [] // 추후 구현
      }
    });
    
  } catch (error) {
    console.error('❌ 대시보드 데이터 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '대시보드 데이터 조회 중 오류가 발생했습니다.'
    });
  }
});

// 404 처리
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `경로를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`,
    timestamp: new Date(),
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /api/status',
      'GET /api/health/system',
      'GET /api/health/database',
      'POST /api/users/login',
      'GET /api/users/me',
      'GET /api/users',
      'GET /api/dashboard/data'
    ]
  });
});

// 글로벌 에러 처리
app.use((error, req, res, next) => {
  console.error('❌ 글로벌 에러:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: '서버 내부 오류가 발생했습니다.',
    timestamp: new Date()
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 PostgreSQL 연동 서버 시작: 포트 ${PORT}`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔗 Render URL: https://gantt-c1oh.onrender.com`);
  console.log(`💾 DATABASE_URL 존재: ${!!process.env.DATABASE_URL}`);
  console.log('✅ 서버 준비 완료!');
});

// 에러 처리
process.on('uncaughtException', (error) => {
  console.error('❌ 예기치 않은 예외:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ 처리되지 않은 프로미스 거부:', reason);
});
