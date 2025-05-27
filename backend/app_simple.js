/**
 * 최소한의 Express 서버 - 의존성 최소화
 */
const express = require('express');
const cors = require('cors');

const app = express();

// 기본 미들웨어
app.use(express.json());
app.use(cors({
  origin: ['https://tubular-vacherin-352fde.netlify.app', 'http://localhost:3000'],
  credentials: true
}));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: '간트 차트 시스템 백엔드 실행 중',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date()
  });
});

// API 기본 상태
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'API 정상 작동',
    timestamp: new Date(),
    endpoints: [
      'GET /',
      'GET /health', 
      'GET /api/status',
      'POST /api/users/login'
    ]
  });
});

// 간단한 헬스체크 API
app.get('/api/health/system', (req, res) => {
  res.json({
    status: 'healthy',
    server: {
      status: 'running',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version
    },
    environment: {
      node_env: process.env.NODE_ENV || 'production',
      database_url_exists: !!process.env.DATABASE_URL,
      port: process.env.PORT || 3000
    },
    database: {
      status: process.env.DATABASE_URL ? 'configured' : 'not_configured',
      note: process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'DATABASE_URL is missing'
    }
  });
});

// 간단한 DB 상태 확인
app.get('/api/health/database', (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      status: 'Database connection failed',
      error: 'DATABASE_URL environment variable is not set',
      environment: {
        database_url_exists: false,
        node_env: process.env.NODE_ENV || 'production'
      }
    });
  }
  
  res.json({
    status: 'Database URL configured',
    environment: {
      database_url_exists: true,
      node_env: process.env.NODE_ENV || 'production'
    },
    note: 'DATABASE_URL is set but connection not tested in this minimal version'
  });
});

// 로그인 엔드포인트 (간단 버전)
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('로그인 시도:', { username, timestamp: new Date() });
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '사용자명과 비밀번호를 입력해주세요.'
      });
    }
    
    // 간단한 하드코딩된 인증 (실제 DB 연결 없이)
    const users = {
      'admin': { password: 'admin123', role: 'admin', email: 'admin@example.com' },
      'tester': { password: 'Test123', role: 'user', email: 'tester@example.com' },
      'manager': { password: 'Manager123', role: 'manager', email: 'manager@example.com' },
      'worker': { password: 'Worker123', role: 'worker', email: 'worker@example.com' }
    };
    
    const user = users[username];
    
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 간단한 토큰 생성 (실제 JWT 없이)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    
    console.log('로그인 성공:', { username, role: user.role });
    
    res.json({
      success: true,
      message: '로그인 성공',
      token: token,
      user: {
        id: Object.keys(users).indexOf(username) + 1,
        username: username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 사용자 정보 조회 (간단 버전)
app.get('/api/users/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  console.log('📡 /api/users/me 요청:', {
    hasAuthHeader: !!authHeader,
    authHeader: authHeader ? authHeader.substring(0, 20) + '...' : null,
    timestamp: new Date().toISOString()
  });
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ 인증 토큰 없음');
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }
  
  // 토큰에서 사용자 정보 추출 (간단한 Base64 디코딩)
  try {
    const token = authHeader.split(' ')[1];
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    const [username, timestamp] = decodedToken.split(':');
    
    console.log('🔍 토큰 디코딩:', { username, timestamp });
    
    // 하드코딩된 사용자 정보
    const users = {
      'admin': { id: 1, username: 'admin', email: 'admin@example.com', firstName: '관리자', lastName: '계정', role: 'admin' },
      'tester': { id: 2, username: 'tester', email: 'tester@example.com', firstName: '테스터', lastName: '계정', role: 'user' },
      'manager': { id: 3, username: 'manager', email: 'manager@example.com', firstName: '매니저', lastName: '계정', role: 'manager' },
      'worker': { id: 4, username: 'worker', email: 'worker@example.com', firstName: '작업자', lastName: '계정', role: 'worker' }
    };
    
    const user = users[username];
    if (!user) {
      console.log('❌ 사용자를 찾을 수 없음:', username);
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }
    
    console.log('✅ 사용자 정보 조회 성공:', user.username);
    
    res.json({
      success: true,
      user: {
        ...user,
        createdAt: new Date(),
        lastLoginAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('❌ 토큰 처리 오류:', error);
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
});

// 모든 사용자 조회 (간단 버전)
app.get('/api/users', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }
  
  res.json({
    success: true,
    count: 4,
    users: [
      { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active' },
      { id: 2, username: 'tester', email: 'tester@example.com', role: 'user', status: 'active' },
      { id: 3, username: 'manager', email: 'manager@example.com', role: 'manager', status: 'active' },
      { id: 4, username: 'worker', email: 'worker@example.com', role: 'worker', status: 'active' }
    ]
  });
});

// 대시보드 데이터 API
app.get('/api/dashboard/data', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  res.json({
    success: true,
    data: {
      overallLoad: 75,
      resourcesCount: 12,
      tasksCount: 28,
      criticalTasks: 3,
      overdueTasksCount: 2,
      upcomingDeadlinesCount: 7,
      mostLoadedResources: [
        { id: 1, name: '김철수', utilization: 95, capacity: 40, department: '개발팀' },
        { id: 2, name: '이영희', utilization: 88, capacity: 40, department: '디자인팀' },
        { id: 3, name: '박지민', utilization: 82, capacity: 40, department: '개발팀' }
      ],
      leastLoadedResources: [
        { id: 4, name: '최민수', utilization: 45, capacity: 40, department: '마케팅팀' },
        { id: 5, name: '정혜린', utilization: 52, capacity: 40, department: 'QA팀' },
        { id: 6, name: '한동석', utilization: 58, capacity: 40, department: '개발팀' }
      ],
      recentOptimizations: [
        { id: 1, timestamp: '2025-05-25T14:30:00Z', description: '김철수의 작업 부하 재조정 완료' },
        { id: 2, timestamp: '2025-05-24T11:15:00Z', description: '프로젝트 A 일정 최적화' },
        { id: 3, timestamp: '2025-05-23T16:45:00Z', description: '리소스 배치 효율화' }
      ],
      upcomingDeadlines: [
        { id: 101, name: 'UI 디자인 완료', resourceName: '이영희', deadline: '2025-06-01', priority: 'high' },
        { id: 102, name: '백엔드 API 개발', resourceName: '김철수', deadline: '2025-06-03', priority: 'medium' },
        { id: 103, name: '테스트 자동화', resourceName: '정혜린', deadline: '2025-06-05', priority: 'high' },
        { id: 104, name: '마케팅 자료 준비', resourceName: '최민수', deadline: '2025-06-02', priority: 'low' }
      ],
      heatmapData: [
        { date: '2025-05-20', value: 85 },
        { date: '2025-05-21', value: 92 },
        { date: '2025-05-22', value: 78 },
        { date: '2025-05-23', value: 88 },
        { date: '2025-05-24', value: 95 },
        { date: '2025-05-25', value: 75 },
        { date: '2025-05-26', value: 82 }
      ]
    }
  });
});

// 역할 정보 API
app.get('/api/roles', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  res.json({
    success: true,
    roles: [
      { 
        id: 1, 
        name: 'admin', 
        displayName: '관리자', 
        description: '시스템 전체 관리 권한',
        permissions: ['read', 'write', 'delete', 'admin']
      },
      { 
        id: 2, 
        name: 'manager', 
        displayName: '매니저', 
        description: '프로젝트 관리 권한',
        permissions: ['read', 'write', 'manage']
      },
      { 
        id: 3, 
        name: 'user', 
        displayName: '사용자', 
        description: '기본 사용자 권한',
        permissions: ['read', 'write']
      },
      { 
        id: 4, 
        name: 'worker', 
        displayName: '작업자', 
        description: '작업 수행 권한',
        permissions: ['read']
      }
    ]
  });
});

// 알림 목록 API
app.get('/api/notifications', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const notifications = [
    {
      id: 1,
      type: 'deadline',
      title: '마감일 임박',
      message: 'UI 디자인 완료 작업이 내일 마감입니다.',
      isRead: false,
      createdAt: '2025-05-26T10:30:00Z',
      relatedTaskId: 101
    },
    {
      id: 2,
      type: 'overload',
      title: '리소스 과부하 경고',
      message: '김철수님의 작업 부하가 95%에 도달했습니다.',
      isRead: false,
      createdAt: '2025-05-26T09:15:00Z',
      relatedResourceId: 1
    },
    {
      id: 3,
      type: 'optimization',
      title: '최적화 완료',
      message: '프로젝트 A 일정이 성공적으로 최적화되었습니다.',
      isRead: true,
      createdAt: '2025-05-25T16:20:00Z'
    },
    {
      id: 4,
      type: 'system',
      title: '시스템 업데이트',
      message: '새로운 기능이 추가되었습니다.',
      isRead: true,
      createdAt: '2025-05-24T14:00:00Z'
    }
  ];

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedNotifications = notifications.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedNotifications,
    pagination: {
      page,
      limit,
      total: notifications.length,
      totalPages: Math.ceil(notifications.length / limit)
    },
    unreadCount: notifications.filter(n => !n.isRead).length
  });
});

// 알림 설정 API
app.get('/api/notifications/settings', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  res.json({
    success: true,
    settings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      notificationTypes: {
        deadlines: true,
        overload: true,
        optimization: true,
        system: false
      }
    }
  });
});

// 알림 설정 업데이트 API
app.put('/api/notifications/settings', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  res.json({
    success: true,
    message: '알림 설정이 업데이트되었습니다.',
    settings: req.body
  });
});

// 알림 읽음 처리 API
app.put('/api/notifications/:id/read', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  res.json({
    success: true,
    message: '알림이 읽음 처리되었습니다.'
  });
});

// 작업 목록 API
app.get('/api/tasks', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  res.json({
    success: true,
    tasks: [
      {
        id: 101,
        name: 'UI 디자인 완료',
        description: '메인 페이지 UI 디자인 작업',
        status: 'in_progress',
        priority: 'high',
        assignedTo: '이영희',
        resourceId: 2,
        startDate: '2025-05-20',
        endDate: '2025-06-01',
        progress: 75,
        estimatedHours: 40,
        actualHours: 30
      },
      {
        id: 102,
        name: '백엔드 API 개발',
        description: '사용자 관리 API 개발',
        status: 'in_progress',
        priority: 'medium',
        assignedTo: '김철수',
        resourceId: 1,
        startDate: '2025-05-22',
        endDate: '2025-06-03',
        progress: 60,
        estimatedHours: 60,
        actualHours: 35
      },
      {
        id: 103,
        name: '테스트 자동화',
        description: '단위 테스트 및 통합 테스트 작성',
        status: 'pending',
        priority: 'high',
        assignedTo: '정혜린',
        resourceId: 5,
        startDate: '2025-05-28',
        endDate: '2025-06-05',
        progress: 0,
        estimatedHours: 32,
        actualHours: 0
      }
    ]
  });
});

// 리소스 목록 API
app.get('/api/resources', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  res.json({
    success: true,
    resources: [
      {
        id: 1,
        name: '김철수',
        email: 'kim@example.com',
        department: '개발팀',
        role: '시니어 개발자',
        capacity: 40,
        currentLoad: 38,
        utilization: 95,
        skills: ['React', 'Node.js', 'Python'],
        status: 'active'
      },
      {
        id: 2,
        name: '이영희',
        email: 'lee@example.com',
        department: '디자인팀',
        role: 'UI/UX 디자이너',
        capacity: 40,
        currentLoad: 35,
        utilization: 88,
        skills: ['Figma', 'Adobe XD', 'Photoshop'],
        status: 'active'
      },
      {
        id: 3,
        name: '박지민',
        email: 'park@example.com',
        department: '개발팀',
        role: '풀스택 개발자',
        capacity: 40,
        currentLoad: 33,
        utilization: 82,
        skills: ['Vue.js', 'Spring Boot', 'MySQL'],
        status: 'active'
      }
    ]
  });
});

// 에러 로깅
app.post('/api/log-error', (req, res) => {
  console.error('프론트엔드 오류:', req.body);
  res.json({ success: true, message: 'Error logged' });
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
      'GET /api/dashboard/data',
      'GET /api/roles',
      'GET /api/notifications',
      'GET /api/notifications/settings',
      'PUT /api/notifications/settings',
      'PUT /api/notifications/:id/read',
      'GET /api/tasks',
      'GET /api/resources'
    ]
  });
});

// 글로벌 에러 처리
app.use((error, req, res, next) => {
  console.error('글로벌 에러:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: '서버 내부 오류가 발생했습니다.',
    timestamp: new Date()
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 최소 서버 시작: 포트 ${PORT}`);
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
