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

# 서버 포트 (Render는 자동으로 PORT 환경 변수를 제공합니다)
# PORT=3000

# Node 환경
NODE_ENV=production
```

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
# API 서버 URL (Render 백엔드 URL)
REACT_APP_API_URL=https://your-render-backend-url.onrender.com
```

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

## 주의사항
- 민감한 정보(비밀번호, API 키 등)는 절대 코드에 포함하지 마세요
- 환경 변수는 배포 환경에서만 설정하고, 로컬 개발에는 .env 파일 사용
