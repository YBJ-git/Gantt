# 작업 부하체크 간트 차트 시스템

이 프로젝트는 조직 내 작업 관리와 리소스 할당을 최적화하기 위한 간트 차트 기반 시스템입니다.

## 기능

- 작업 부하 시각화 및 분석
- 리소스 할당 최적화
- 작업 일정 관리
- 부하 최적화 알고리즘
- 실시간 협업 및 알림
- 종합 보고서 및 분석

## 기술 스택

- **프론트엔드**: React, Redux, Ant Design
- **백엔드**: Node.js, Express
- **데이터베이스**: MSSQL
- **캐싱**: Redis
- **컨테이너화**: Docker
- **CI/CD**: GitHub Actions
- **배포**: Netlify(프론트엔드), Render(백엔드)

## 배포 정보

### 프론트엔드 배포 (Netlify)

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-netlify-badge/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)

배포 URL: https://your-site-name.netlify.app

### 백엔드 배포 (Render)

API 엔드포인트: https://your-api-name.onrender.com/api

## 로컬 개발 환경 설정

1. 저장소 복제:
   ```
   git clone https://github.com/your-username/your-repository.git
   cd your-repository
   ```

2. 프론트엔드 설정:
   ```
   cd frontend
   npm install
   npm start
   ```

3. 백엔드 설정:
   ```
   cd backend
   npm install
   npm run dev
   ```

## 배포 가이드

- [Netlify 배포 체크리스트](./docs/netlify-deployment-checklist.md)
- [Netlify 배포 초보자 가이드](./docs/netlify-deployment-beginner-guide.md)
- [환경 변수 관리 가이드](./docs/environment-variables-guide.md)
- [배포 후 확인 및 모니터링 가이드](./docs/post-deployment-monitoring-guide.md)

## Netlify 배포

Netlify를 사용하여 프론트엔드를 배포하려면:

### 방법 1: 배포 스크립트 사용 (권장)

```bash
# Windows
deploy-to-netlify.bat

# Linux/Mac
./scripts/setup-netlify.sh
```

Netlify 배포 과정:
1. Netlify CLI가 자동으로 설치됩니다.
2. 브라우저가 열리면 Netlify 계정에 로그인합니다.
3. 환경 변수가 자동으로 설정됩니다.
4. 배포가 완료되면 접속 URL이 표시됩니다.

### 방법 2: GitHub 연동을 통한 자동 배포

GitHub Actions를 통해 자동으로 배포할 수 있습니다:
- `main` 브랜치에 푸시 → Netlify에 자동 배포
- PR 생성 → Netlify에 미리보기 배포

필요한 GitHub Secrets:
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `RENDER_DEPLOY_HOOK_URL`

## 자동 배포 (CI/CD)

이 프로젝트는 GitHub Actions를 사용하여 자동 배포를 지원합니다.
- `develop` 브랜치에 푸시 → 스테이징 환경에 자동 배포
- `main` 브랜치에 푸시 → 프로덕션 환경에 자동 배포

## 환경 설정

### 환경 변수
프로젝트에는 다음과 같은 환경 변수 예제 파일이 포함되어 있습니다:
- `.env.example` - Docker Compose 환경 변수
- `frontend/.env.production.example` - 프론트엔드 환경 변수
- `backend/.env.production.example` - 백엔드 환경 변수

각 환경 변수 파일을 복사하여 실제 환경에 맞게 수정 후 사용하세요.

## 테스트

### 통합 테스트

```bash
# 프론트엔드 통합 테스트
cd frontend
npm run test:integration

# 백엔드 API 테스트
cd backend
npm run test:api
```

### 사용자 테스트

사용자 테스트 환경을 설정하고 실행하려면:

```bash
# Windows
run-user-test.bat

# Linux/Mac
./run-user-test.sh
```

자세한 테스트 시나리오는 `user-test-scenarios.md` 파일을 참조하세요.

## 모니터링

시스템은 Prometheus와 Grafana를 사용하여 모니터링됩니다. Netlify 및 Render 배포에 대한 모니터링 방법은 [배포 후 확인 및 모니터링 가이드](./docs/post-deployment-monitoring-guide.md)를 참조하세요.

## 프로젝트 구조

### 프론트엔드

```
frontend/
├── public/            # 정적 파일
├── src/
│   ├── components/    # 컴포넌트
│   │   ├── layout/    # 레이아웃 컴포넌트
│   │   └── feature/   # 기능별 컴포넌트
│   ├── contexts/      # 컨텍스트
│   ├── hooks/         # 커스텀 훅
│   ├── pages/         # 페이지 컴포넌트
│   ├── redux/         # Redux 관련 파일
│   ├── services/      # API 서비스
│   ├── utils/         # 유틸리티 함수
│   ├── tests/         # 테스트 파일
│   ├── App.js         # 앱 컴포넌트
│   └── index.js       # 진입점
├── Dockerfile         # Docker 설정
├── netlify.toml       # Netlify 설정
├── package.json
└── README.md
```

### 백엔드

```
backend/
├── src/
│   ├── api/           # API 엔드포인트
│   ├── config/        # 환경 설정
│   ├── controllers/   # 컨트롤러
│   ├── database/      # 데이터베이스 관련 파일
│   ├── middleware/    # 미들웨어
│   ├── repositories/  # 데이터 액세스 레이어
│   ├── routes/        # 라우트 정의
│   ├── services/      # 비즈니스 로직
│   ├── tests/         # 테스트 파일
│   ├── utils/         # 유틸리티 함수
│   └── workers/       # 백그라운드 워커
├── Dockerfile         # Docker 설정
├── render.yaml        # Render 설정
├── package.json
└── README.md
```

## 기여 방법

1. 이 저장소를 포크합니다.
2. 기능 브랜치를 생성합니다: `git checkout -b feature/amazing-feature`
3. 변경 사항을 커밋합니다: `git commit -m 'Add some amazing feature'`
4. 브랜치에 푸시합니다: `git push origin feature/amazing-feature`
5. Pull Request를 생성합니다.

## 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다. 자세한 내용은 LICENSE 파일을 참조하세요.

## 연락처

프로젝트 관리자: admin@company.com
