# Render 환경변수 설정

## 필수 환경변수 (Render Dashboard에서 설정)

```
NODE_ENV=production
PORT=3000

# PostgreSQL 연결 (가장 중요!)
DATABASE_URL=postgresql://my_project_db_4s88_user:nEGnv1mzRKqSn8eG9HTxzlv9u53s9bto@dpg-d0mm2vmuk2gs73fp6ld0-a.oregon-postgres.render.com/my_project_db_4s88

# 백업용 개별 DB 설정
DB_HOST=dpg-d0mm2vmuk2gs73fp6ld0-a.oregon-postgres.render.com
DB_PORT=5432
DB_USER=my_project_db_4s88_user
DB_PASSWORD=nEGnv1mzRKqSn8eG9HTxzlv9u53s9bto
DB_NAME=my_project_db_4s88
DB_SSL=true
DB_CONNECTION_LIMIT=20

# CORS 설정 (프론트엔드 URL)
CORS_ORIGIN=https://tubular-vacherin-352fde.netlify.app

# JWT 설정
JWT_SECRET=secure_jwt_secret_for_workload_system_2025
JWT_EXPIRES_IN=24h

# 기타 설정
LOG_LEVEL=info
ENABLE_CACHE=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Render 서비스 설정

- **Service Type**: Web Service
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Auto-Deploy**: Yes
- **Environment**: Node.js

## 배포 후 확인사항

1. https://gantt-c1oh.onrender.com/health ✅
2. https://gantt-c1oh.onrender.com/api/health ✅
3. https://gantt-c1oh.onrender.com/api/status ✅
4. PostgreSQL 연결 상태 확인
5. 로그인 API 테스트

## 문제 해결

만약 500 오류가 계속 발생한다면:

1. Render Dashboard > Logs 확인
2. DATABASE_URL 환경변수 재확인
3. PostgreSQL 데이터베이스 접근 권한 확인
4. Health Check 경로 확인 (/api/health)
