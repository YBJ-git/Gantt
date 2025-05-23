# 배포 환경 변수 설정 가이드

## Render (백엔드) 환경 변수

백엔드를 Render에 배포할 때 다음 환경 변수를 설정해야 합니다:

### 필수 환경 변수
```
# 데이터베이스 타입
DB_TYPE=postgres

# PostgreSQL 데이터베이스 설정
POSTGRES_HOST=your-postgres-host
POSTGRES_PORT=5432
POSTGRES_DB=myproject_db
POSTGRES_USER=your-postgres-user
POSTGRES_PASSWORD=your-postgres-password

# Node 환경
NODE_ENV=production

# CORS 설정 (쉼표로 구분된 도메인 목록)
CORS_ORIGIN=https://your-netlify-domain.netlify.app,http://localhost:3000

# JWT Secret (보안을 위해 강력한 랜덤 문자열 사용)
JWT_SECRET=your-very-secure-random-string
```

### 중요: Render의 PORT 환경 변수
- Render는 자동으로 `PORT` 환경 변수를 제공합니다
- 이 값을 수동으로 설정하지 마세요
- 백엔드 코드는 `process.env.PORT`를 자동으로 사용합니다

### Render PostgreSQL 데이터베이스 사용 시
Render에서 PostgreSQL 데이터베이스를 생성하면 다음과 같은 형식의 연결 URL을 제공합니다:
```
postgresql://user:password@hostname:port/database
```

이 정보를 사용하여 위의 환경 변수를 설정하세요.

## Netlify (프론트엔드) 환경 변수

프론트엔드를 Netlify에 배포할 때 다음 환경 변수를 설정해야 합니다:

### 필수 환경 변수
```
# API 서버 URL (Render 백엔드 URL - 포트 번호 없이!)
REACT_APP_API_URL=https://your-render-backend-url.onrender.com/api
```

### 중요: URL 형식
- Render URL에는 포트 번호를 포함하지 마세요
- 항상 `/api` 경로를 포함하세요
- HTTPS를 사용하세요 (Render는 자동으로 HTTPS 제공)

## 설정 방법

### Render에서 환경 변수 설정
1. Render 대시보드에서 서비스 선택
2. Environment 탭 클릭
3. Add Environment Variable 클릭
4. 위의 환경 변수 추가

### Netlify에서 환경 변수 설정
1. Netlify 대시보드에서 사이트 선택
2. Site settings > Environment variables 클릭
3. Add a variable 클릭
4. 위의 환경 변수 추가

## 배포 체크리스트

### 백엔드 (Render)
- [ ] PostgreSQL 데이터베이스 생성 및 연결
- [ ] 모든 환경 변수 설정
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Node Version: 16 이상

### 프론트엔드 (Netlify)
- [ ] 환경 변수 설정
- [ ] Build Command: `npm run build`
- [ ] Publish Directory: `build`
- [ ] _redirects 파일 확인

## 주의사항
- 민감한 정보(비밀번호, API 키 등)는 절대 코드에 포함하지 마세요
- 환경 변수는 배포 환경에서만 설정하고, 로컬 개발에는 .env 파일 사용
- CORS_ORIGIN에는 프론트엔드 도메인을 반드시 포함시키세요
