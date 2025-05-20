# 작업 부하체크 간트 차트 시스템 개발자 가이드

## 목차

1. [소개](#1-소개)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [백엔드 구조](#3-백엔드-구조)
4. [프론트엔드 구조](#4-프론트엔드-구조)
5. [부하 최적화 모듈](#5-부하-최적화-모듈)
6. [개발 환경 설정](#6-개발-환경-설정)
7. [테스트](#7-테스트)
8. [배포](#8-배포)
9. [유지보수](#9-유지보수)

## 1. 소개

본 문서는 '작업 부하체크 간트 차트 시스템'의 개발자를 위한 기술 문서입니다. 이 시스템은 조직 내 작업 관리와 리소스 할당을 최적화하기 위한 도구로, 특히 부하 최적화 기능을 중심으로 설명합니다.

### 1.1 시스템 목적

- 조직 내 작업과 리소스의 효율적인 관리
- 리소스 부하 상태 실시간 모니터링
- 부하 최적화를 통한 리소스 활용도 개선
- 작업 일정 및 자원 할당 최적화

### 1.2 주요 기능

- 간트 차트 기반 작업 일정 관리
- 리소스별 부하 분석 및 시각화
- 부하 최적화 추천 및 자동 재분배
- 미래 부하 예측 및 시나리오 분석

## 2. 시스템 아키텍처

시스템은 크게 프론트엔드와 백엔드로 구성되며, RESTful API를 통해 통신합니다.

### 2.1 기술 스택

- **프론트엔드**:
  - React
  - Redux
  - Ant Design
  - Chart.js

- **백엔드**:
  - Node.js
  - Express
  - MS SQL Server

- **인프라**:
  - Docker
  - Nginx
  - Azure App Service

### 2.2 시스템 구성도

```
+--------------------+    +---------------------+    +----------------+
|                    |    |                     |    |                |
|    프론트엔드      |<-->|      백엔드        |<-->|    데이터베이스  |
|    (React/Redux)   |    |   (Node.js/Express) |    |   (MS SQL)     |
|                    |    |                     |    |                |
+--------------------+    +---------------------+    +----------------+
```

## 3. 백엔드 구조

백엔드는 MVC 패턴을 기반으로 설계되었습니다.

### 3.1 디렉토리 구조

```
backend/
├── src/
│   ├── controllers/       # 컨트롤러 (API 엔드포인트 처리)
│   ├── services/          # 서비스 (비즈니스 로직)
│   ├── repositories/      # 레포지토리 (데이터 액세스)
│   ├── models/            # 데이터 모델
│   ├── routes/            # 라우팅 설정
│   ├── middlewares/       # 미들웨어
│   ├── utils/             # 유틸리티 함수
│   ├── config/            # 설정 파일
│   └── app.js             # 앱 진입점
├── tests/                 # 테스트 코드
└── package.json           # 패키지 설정
```

### 3.2 주요 모듈 설명

- **controllers/**: API 요청 처리 및 응답 반환
  - `loadOptimizationController.js`: 부하 최적화 관련 엔드포인트

- **services/**: 비즈니스 로직 구현
  - `loadOptimizationService.js`: 부하 최적화 관련 비즈니스 로직

- **repositories/**: 데이터베이스 접근 및 조작
  - `loadOptimizationRepository.js`: 부하 최적화 관련 데이터 조작

- **utils/**: 공통 유틸리티
  - `loadCalculationUtils.js`: 부하 계산 관련 유틸리티
  - `dateUtils.js`: 날짜 처리 유틸리티

### 3.3 API 엔드포인트

| 엔드포인트                          | 메서드 | 설명                          |
|-----------------------------------|-------|------------------------------|
| `/api/loadOptimization/data`      | GET   | 부하 데이터 조회               |
| `/api/loadOptimization/resource`  | GET   | 리소스별 부하 분석             |
| `/api/loadOptimization/recommendations` | GET | 부하 최적화 추천 사항        |
| `/api/loadOptimization/autoDistribute` | POST | 작업 자동 재분배            |
| `/api/loadOptimization/apply`     | POST  | 부하 최적화 적용               |
| `/api/loadOptimization/predict`   | POST  | 부하 예측 분석                 |

## 4. 프론트엔드 구조

프론트엔드는 React와 Redux를 기반으로 구성되었습니다.

### 4.1 디렉토리 구조

```
frontend/
├── public/                # 정적 파일
├── src/
│   ├── components/        # 리액트 컴포넌트
│   │   ├── common/        # 공통 컴포넌트
│   │   ├── layout/        # 레이아웃 컴포넌트
│   │   ├── charts/        # 차트 컴포넌트
│   │   └── loadOptimization/ # 부하 최적화 관련 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   ├── redux/             # Redux 관련 파일
│   │   ├── actions/       # 액션 생성자
│   │   ├── reducers/      # 리듀서
│   │   ├── types/         # 액션 타입 정의
│   │   └── store.js       # 스토어 설정
│   ├── services/          # API 서비스
│   ├── hooks/             # 커스텀 훅
│   ├── utils/             # 유틸리티 함수
│   ├── constants/         # 상수 정의
│   ├── assets/            # 이미지, 스타일 등 자원
│   ├── App.js             # 앱 컴포넌트
│   └── index.js           # 앱 진입점
└── package.json           # 패키지 설정
```

### 4.2 주요 모듈 설명

- **components/loadOptimization/**: 부하 최적화 관련 컴포넌트
  - `LoadDataGrid.js`: 부하 데이터 표시 그리드
  - `LoadHeatmap.js`: 부하 히트맵 차트
  - `OptimizationRecommendations.js`: 최적화 추천 사항 컴포넌트
  - `AutoDistributeForm.js`: 자동 분배 설정 폼

- **redux/actions/**: Redux 액션
  - `loadOptimizationActions.js`: 부하 최적화 관련 액션

- **redux/reducers/**: Redux 리듀서
  - `loadOptimizationReducer.js`: 부하 최적화 관련 상태 관리

- **services/**: API 호출 서비스
  - `loadOptimizationService.js`: 부하 최적화 API 호출

- **hooks/**: 커스텀 훅
  - `useLoadOptimization.js`: 부하 최적화 관련 커스텀 훅

## 5. 부하 최적화 모듈

부하 최적화 모듈은 시스템의 핵심 기능입니다. 이 섹션에서는 부하 최적화 알고리즘과 구현에 대해 설명합니다.

### 5.1 부하 계산 로직

부하 계산은 `loadCalculationUtils.js`에서 처리되며, 주요 함수는 다음과 같습니다:

- **calculateResourceLoad**: 리소스별 부하 계산
- **calculateSystemLoad**: 시스템 전체 부하 계산
- **calculateLoadScore**: 부하 균형 점수 계산

부하율 계산 공식:
```
부하율(%) = (일일 작업량 / 일일 용량) * 100
```

### 5.2 최적화 알고리즘

부하 최적화 알고리즘은 다음 단계로 구성됩니다:

1. **과부하 리소스 식별**:
   - 임계값(기본값: 80%)을 초과하는 리소스 식별
   - 과부하 발생 날짜 파악

2. **이동 가능 작업 식별**:
   - 우선순위가 낮은 작업
   - 특정 리소스에 고정되지 않은 작업
   - 필요 스킬이 다른 리소스에도 있는 작업

3. **적합한 대상 리소스 찾기**:
   - 저부하 상태의 리소스
   - 작업에 필요한 스킬을 가진 리소스
   - 해당 날짜에 여유 용량이 있는 리소스

4. **최적 조합 선택**:
   - 작업 이동 시 예상 부하 감소량 계산
   - 부하 균형성 최대화하는 조합 선택

## 6. 개발 환경 설정

### 6.1 필수 소프트웨어

- Node.js (v14 이상)
- npm (v6 이상)
- MS SQL Server
- Git

### 6.2 환경 변수

`.env` 파일에 다음 환경 변수를 설정해야 합니다:

```
# 서버 설정
PORT=3000
NODE_ENV=development

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=1433
DB_NAME=work_load_system
DB_USER=username
DB_PASSWORD=password

# JWT 설정
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# 로깅 설정
LOG_LEVEL=debug
```

### 6.3 설치 및 실행

**백엔드**:
```bash
cd backend
npm install
npm run dev
```

**프론트엔드**:
```bash
cd frontend
npm install
npm start
```

## 7. 테스트

### 7.1 단위 테스트

Jest를 사용하여 단위 테스트를 실행합니다:

```bash
cd backend
npm test
```

주요 테스트 파일:
- `loadOptimizationService.test.js`: 서비스 로직 테스트
- `loadOptimizationController.test.js`: 컨트롤러 테스트
- `loadCalculationUtils.test.js`: 유틸리티 함수 테스트
- `dateUtils.test.js`: 날짜 유틸리티 테스트

### 7.2 통합 테스트

통합 테스트는 다음 명령으로 실행합니다:

```bash
npm run test:integration
```

주요 통합 테스트:
- `loadOptimizationApi.test.js`: API 엔드포인트 통합 테스트

### 7.3 성능 테스트

성능 테스트는 Artillery를 사용하여 실행합니다:

```bash
npm run test:performance
```

성능 테스트 시나리오:
- `load-optimization-performance.json`: 부하 최적화 API 성능 테스트
- `loadOptimizationServicePerformance.test.js`: 서비스 성능 테스트

## 8. 배포

### 8.1 빌드

**백엔드**:
```bash
cd backend
npm run build
```

**프론트엔드**:
```bash
cd frontend
npm run build
```

### 8.2 Docker 배포

Docker 컨테이너를 사용한 배포:

```bash
# 백엔드 이미지 빌드
docker build -t work-load-backend ./backend

# 프론트엔드 이미지 빌드
docker build -t work-load-frontend ./frontend

# 컨테이너 실행
docker-compose up -d
```

### 8.3 Azure 배포

Azure App Service를 통한 배포:

1. Azure Portal에서 App Service 생성
2. GitHub Actions 또는 Azure DevOps를 통한 CI/CD 파이프라인 설정
3. 환경 변수 설정

## 9. 유지보수

### 9.1 로깅

시스템은 Winston 로거를 사용하여 로그를 기록합니다:

- `info`: 정상 작동 정보
- `error`: 오류 정보
- `debug`: 디버깅을 위한 상세 정보

로그 파일은 `logs/` 디렉토리에 저장됩니다.

### 9.2 모니터링

- Azure Application Insights를 통한 모니터링
- Prometheus + Grafana 대시보드를 통한 성능 모니터링

### 9.3 확장 가능성

새로운 기능 추가 방법:

1. 백엔드:
   - 새 모델 정의
   - 레포지토리, 서비스, 컨트롤러 추가
   - 라우트 등록

2. 프론트엔드:
   - Redux 액션, 리듀서, 타입 추가
   - API 서비스 메서드 추가
   - 필요한 컴포넌트 구현
   - 라우팅 및 페이지 구성

### 9.4 문제 해결

일반적인 문제와 해결책:

1. **부하 계산 오류**:
   - 날짜 처리 방식 확인
   - 주말/휴일 처리 로직 확인
   - 작업 및 리소스 데이터 유효성 검증

2. **성능 이슈**:
   - 데이터베이스 쿼리 최적화
   - 계산 로직 캐싱 고려
   - 대량 데이터 페이징 처리

3. **API 오류**:
   - 요청/응답 로그 확인
   - 오류 응답의 상세 메시지 분석
   - 요청 파라미터 유효성 검증
