# 환경 변수 관리 가이드

이 문서는 작업 부하체크 간트 차트 시스템의 환경 변수를 관리하는 방법을 설명합니다.

## 프론트엔드 환경 변수

React 애플리케이션에서는 `REACT_APP_` 접두사가 붙은 환경 변수만 클라이언트 코드에서 접근할 수 있습니다.

### 로컬 개발 환경

1. 프로젝트 루트에 `.env.local` 파일 생성:

```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development
```

2. 로컬 환경에서 다른 환경 사용 시:
   - `.env.development`: 개발 환경
   - `.env.test`: 테스트 환경
   - `.env.production`: 프로덕션 환경

### Netlify 환경

1. Netlify 대시보드 접속
2. 해당 사이트 선택
3. Site settings > Build & deploy > Environment 선택
4. "Edit variables" 클릭하여 환경 변수 추가/수정

### GitHub Actions 환경

GitHub 저장소 설정에서 Secrets를 관리:

1. 저장소 페이지에서 "Settings" 탭 클릭
2. 왼쪽 메뉴에서 "Secrets and variables" > "Actions" 선택
3. "New repository secret" 버튼 클릭
4. 필요한 환경 변수 추가:
   - `NETLIFY_AUTH_TOKEN`: Netlify 인증 토큰
   - `NETLIFY_SITE_ID`: Netlify 사이트 ID
   - `RENDER_DEPLOY_HOOK_URL`: Render 배포 웹훅 URL

## 백엔드 환경 변수

### 로컬 개발 환경

1. 백엔드 디렉토리에 `.env` 파일 생성:

```
PORT=8080
NODE_ENV=development
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=password
DB_NAME=workload_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key
```

### Render 환경

Render 대시보드에서 환경 변수 설정:

1. Render 대시보드 접속
2. 해당 서비스 선택
3. "Environment" 탭 선택
4. "Add Environment Variable" 클릭하여 필요한 변수 추가

## 보안 고려사항

1. **민감한 정보는 항상 환경 변수로 관리하세요**:
   - API 키, 비밀번호, 토큰 등을 코드에 하드코딩하지 마세요.

2. **프론트엔드에서 민감한 정보 사용 주의**:
   - `REACT_APP_` 환경 변수는 클라이언트 코드에 포함되어 브라우저에서 접근 가능합니다.
   - 민감한 정보는 백엔드에서만 사용하세요.

3. **환경 변수 파일은 버전 관리에서 제외**:
   - `.gitignore`에 `.env*` 파일을 추가하세요.
   - 대신 `.env.example` 파일을 제공하여 필요한 변수 목록 공유하세요.

## 환경 변수 템플릿

### 프론트엔드 (.env.example)

```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development
```

### 백엔드 (.env.example)

```
PORT=8080
NODE_ENV=development
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=password
DB_NAME=workload_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key
```
