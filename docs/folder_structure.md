# 폴더/파일 구조

## 루트 디렉토리
```
C:\MyProject\
├── frontend/             # 프론트엔드 코드
├── backend/              # 백엔드 코드
├── docs/                 # 문서
├── tests/                # 테스트 코드
├── scripts/              # 유틸리티 스크립트
├── .gitignore            # Git 무시 파일
├── README.md             # 프로젝트 개요
└── package.json          # 프로젝트 메타데이터
```

## 프론트엔드 구조
```
C:\MyProject\frontend\
├── public/                         # 정적 파일
│   ├── index.html                  # 메인 HTML
│   ├── favicon.ico                 # 파비콘
│   └── assets/                     # 정적 자산
│       ├── images/                 # 이미지
│       └── fonts/                  # 폰트
├── src/                            # 소스 코드
│   ├── index.js                    # 진입점
│   ├── App.js                      # 루트 컴포넌트
│   ├── routes.js                   # 라우팅 설정
│   ├── styles/                     # 스타일
│   │   ├── variables.scss          # SCSS 변수
│   │   ├── mixins.scss             # SCSS 믹스인
│   │   ├── components/             # 컴포넌트 스타일
│   │   └── pages/                  # 페이지 스타일
│   ├── components/                 # 공통 컴포넌트
│   │   ├── common/                 # 공통 UI 컴포넌트
│   │   │   ├── Button/             # 버튼 컴포넌트
│   │   │   ├── Card/               # 카드 컴포넌트
│   │   │   ├── Modal/              # 모달 컴포넌트
│   │   │   ├── Table/              # 테이블 컴포넌트
│   │   │   ├── Form/               # 폼 관련 컴포넌트
│   │   │   ├── Chart/              # 차트 컴포넌트
│   │   │   ├── Notification/       # 알림 컴포넌트
│   │   │   └── Navigation/         # 네비게이션 컴포넌트
│   │   ├── layout/                 # 레이아웃 컴포넌트
│   │   │   ├── Header/             # 헤더 컴포넌트
│   │   │   ├── Sidebar/            # 사이드바 컴포넌트
│   │   │   ├── Footer/             # 푸터 컴포넌트
│   │   │   └── MainLayout/         # 메인 레이아웃
│   │   └── feature/                # 기능별 컴포넌트
│   │       ├── Dashboard/          # 대시보드 관련 컴포넌트
│   │       ├── TaskManagement/     # 작업 관리 관련 컴포넌트
│   │       ├── ResourceAnalysis/   # 리소스 분석 관련 컴포넌트
│   │       ├── Reports/            # 보고서 관련 컴포넌트
│   │       └── Settings/           # 설정 관련 컴포넌트
│   ├── pages/                      # 페이지 컴포넌트
│   │   ├── Dashboard/              # 대시보드 페이지
│   │   ├── Tasks/                  # 작업 관련 페이지
│   │   │   ├── TaskList/           # 작업 목록 페이지
│   │   │   ├── TaskDetail/         # 작업 상세 페이지
│   │   │   ├── TaskCreate/         # 작업 생성 페이지
│   │   │   └── TaskCalendar/       # 작업 캘린더 페이지
│   │   ├── Resources/              # 리소스 관련 페이지
│   │   │   ├── ResourceList/       # 리소스 목록 페이지
│   │   │   ├── ResourceDetail/     # 리소스 상세 페이지
│   │   │   └── LoadAnalysis/       # 부하 분석 페이지
│   │   ├── Reports/                # 보고서 관련 페이지
│   │   │   ├── ReportTemplates/    # 보고서 템플릿 페이지
│   │   │   ├── ReportCreate/       # 보고서 생성 페이지
│   │   │   └── ReportView/         # 보고서 보기 페이지
│   │   ├── Auth/                   # 인증 관련 페이지
│   │   │   ├── Login/              # 로그인 페이지
│   │   │   ├── Register/           # 회원가입 페이지
│   │   │   └── ForgotPassword/     # 비밀번호 찾기 페이지
│   │   └── Settings/               # 설정 페이지
│   ├── services/                   # 서비스 로직
│   │   ├── api/                    # API 호출 모듈
│   │   │   ├── taskApi.js          # 작업 관련 API
│   │   │   ├── resourceApi.js      # 리소스 관련 API
│   │   │   ├── reportApi.js        # 보고서 관련 API
│   │   │   ├── authApi.js          # 인증 관련 API
│   │   │   └── settingsApi.js      # 설정 관련 API
│   │   ├── utils/                  # 유틸리티 함수
│   │   │   ├── formatters.js       # 데이터 포맷팅 함수
│   │   │   ├── validators.js       # 유효성 검사 함수
│   │   │   ├── calculations.js     # 계산 관련 함수
│   │   │   └── helpers.js          # 기타 헬퍼 함수
│   │   └── hooks/                  # 커스텀 훅
│   │       ├── useAuth.js          # 인증 관련 훅
│   │       ├── useTasks.js         # 작업 관련 훅
│   │       ├── useResources.js     # 리소스 관련 훅
│   │       └── useReports.js       # 보고서 관련 훅
│   ├── store/                      # 상태 관리
│   │   ├── index.js                # 스토어 설정
│   │   ├── actions/                # 액션 생성자
│   │   │   ├── taskActions.js      # 작업 관련 액션
│   │   │   ├── resourceActions.js  # 리소스 관련 액션
│   │   │   ├── reportActions.js    # 보고서 관련 액션
│   │   │   ├── authActions.js      # 인증 관련 액션
│   │   │   └── uiActions.js        # UI 관련 액션
│   │   ├── reducers/               # 리듀서
│   │   │   ├── taskReducer.js      # 작업 관련 리듀서
│   │   │   ├── resourceReducer.js  # 리소스 관련 리듀서
│   │   │   ├── reportReducer.js    # 보고서 관련 리듀서
│   │   │   ├── authReducer.js      # 인증 관련 리듀서
│   │   │   └── uiReducer.js        # UI 관련 리듀서
│   │   └── selectors/              # 셀렉터
│   │       ├── taskSelectors.js    # 작업 관련 셀렉터
│   │       ├── resourceSelectors.js # 리소스 관련 셀렉터
│   │       ├── reportSelectors.js  # 보고서 관련 셀렉터
│   │       └── authSelectors.js    # 인증 관련 셀렉터
│   └── constants/                  # 상수
│       ├── actionTypes.js          # 액션 타입 상수
│       ├── apiEndpoints.js         # API 엔드포인트 상수
│       ├── statusCodes.js          # 상태 코드 상수
│       └── uiConstants.js          # UI 관련 상수
├── config/                         # 설정 파일
│   ├── webpack.config.js           # Webpack 설정
│   └── jest.config.js              # Jest 설정
└── package.json                    # 의존성 및 스크립트
```

## 백엔드 구조
```
C:\MyProject\backend\
├── src/                           # 소스 코드
│   ├── index.js                   # 진입점
│   ├── config/                    # 설정
│   │   ├── database.js            # 데이터베이스 설정
│   │   ├── server.js              # 서버 설정
│   │   ├── auth.js                # 인증 설정
│   │   └── logger.js              # 로깅 설정
│   ├── api/                       # API 라우트
│   │   ├── routes/                # 라우트 정의
│   │   │   ├── taskRoutes.js      # 작업 관련 라우트
│   │   │   ├── resourceRoutes.js  # 리소스 관련 라우트
│   │   │   ├── reportRoutes.js    # 보고서 관련 라우트
│   │   │   ├── authRoutes.js      # 인증 관련 라우트
│   │   │   └── settingsRoutes.js  # 설정 관련 라우트
│   │   ├── controllers/           # 컨트롤러
│   │   │   ├── taskController.js  # 작업 관련 컨트롤러
│   │   │   ├── resourceController.js # 리소스 관련 컨트롤러
│   │   │   ├── reportController.js # 보고서 관련 컨트롤러
│   │   │   ├── authController.js   # 인증 관련 컨트롤러
│   │   │   └── settingsController.js # 설정 관련 컨트롤러
│   │   ├── middlewares/           # 미들웨어
│   │   │   ├── authMiddleware.js  # 인증 미들웨어
│   │   │   ├── errorMiddleware.js # 에러 처리 미들웨어
│   │   │   ├── loggingMiddleware.js # 로깅 미들웨어
│   │   │   └── validationMiddleware.js # 유효성 검사 미들웨어
│   │   └── validations/           # 유효성 검사 스키마
│   │       ├── taskValidation.js  # 작업 유효성 검사
│   │       ├── resourceValidation.js # 리소스 유효성 검사
│   │       ├── reportValidation.js # 보고서 유효성 검사
│   │       └── authValidation.js  # 인증 유효성 검사
│   ├── models/                    # 데이터 모델
│   │   ├── Task.js                # 작업 모델
│   │   ├── Resource.js            # 리소스 모델
│   │   ├── Report.js              # 보고서 모델
│   │   ├── User.js                # 사용자 모델
│   │   └── index.js               # 모델 내보내기
│   ├── services/                  # 비즈니스 로직
│   │   ├── taskService.js         # 작업 관련 서비스
│   │   ├── resourceService.js     # 리소스 관련 서비스
│   │   ├── reportService.js       # 보고서 관련 서비스
│   │   ├── authService.js         # 인증 관련 서비스
│   │   └── optimizationService.js # 부하 최적화 관련 서비스
│   ├── utils/                     # 유틸리티
│   │   ├── database.js            # 데이터베이스 유틸리티
│   │   ├── logger.js              # 로깅 유틸리티
│   │   ├── helpers.js             # 헬퍼 함수
│   │   ├── validators.js          # 유효성 검사 함수
│   │   └── formatters.js          # 데이터 포맷팅 함수
│   └── docs/                      # API 문서
│       └── swagger.json           # Swagger 문서
├── scripts/                       # 스크립트
│   ├── migrations/                # 데이터베이스 마이그레이션
│   ├── seeds/                     # 데이터베이스 시드
│   └── setup.js                   # 초기 설정 스크립트
├── logs/                          # 로그 파일
├── tests/                         # 테스트
│   ├── unit/                      # 단위 테스트
│   │   ├── services/              # 서비스 테스트
│   │   ├── controllers/           # 컨트롤러 테스트
│   │   └── models/                # 모델 테스트
│   ├── integration/               # 통합 테스트
│   │   ├── api/                   # API 테스트
│   │   └── database/              # 데이터베이스 테스트
│   └── fixtures/                  # 테스트 데이터
├── .env.example                   # 환경 변수 예시
└── package.json                   # 의존성 및 스크립트
```

## 문서 구조
```
C:\MyProject\docs\
├── requirements/                  # 요구사항 문서
│   ├── project_overview.md        # 프로젝트 개요
│   ├── ui_ux_requirements.md      # UI/UX 요구사항
│   ├── main_pages.md              # 주요 페이지/화면
│   └── design_system.md           # 디자인 시스템
├── technical/                     # 기술 문서
│   ├── architecture.md            # 아키텍처 문서
│   ├── api/                       # API 문서
│   │   ├── overview.md            # API 개요
│   │   ├── task_api.md            # 작업 API 문서
│   │   ├── resource_api.md        # 리소스 API 문서
│   │   ├── report_api.md          # 보고서 API 문서
│   │   └── auth_api.md            # 인증 API 문서
│   ├── database/                  # 데이터베이스 문서
│   │   ├── erd.md                 # ERD 문서
│   │   ├── schema.md              # 스키마 문서
│   │   └── queries.md             # 주요 쿼리 문서
│   └── deployment/                # 배포 문서
│       ├── setup.md               # 설정 가이드
│       ├── deployment.md          # 배포 가이드
│       └── monitoring.md          # 모니터링 가이드
├── user/                          # 사용자 문서
│   ├── getting_started.md         # 시작하기 가이드
│   ├── user_manual.md             # 사용자 매뉴얼
│   ├── admin_manual.md            # 관리자 매뉴얼
│   └── faq.md                     # 자주 묻는 질문
└── development/                   # 개발 문서
    ├── setup.md                   # 개발 환경 설정
    ├── coding_standards.md        # 코딩 표준
    ├── git_workflow.md            # Git 워크플로우
    └── testing.md                 # 테스트 가이드
```

## 테스트 구조
```
C:\MyProject\tests\
├── frontend/                      # 프론트엔드 테스트
│   ├── unit/                      # 단위 테스트
│   │   ├── components/            # 컴포넌트 테스트
│   │   ├── services/              # 서비스 테스트
│   │   └── store/                 # 스토어 테스트
│   ├── integration/               # 통합 테스트
│   │   └── pages/                 # 페이지 통합 테스트
│   └── e2e/                       # 엔드투엔드 테스트
│       ├── flows/                 # 주요 흐름 테스트
│       └── pages/                 # 페이지 E2E 테스트
└── backend/                       # 백엔드 테스트
    ├── unit/                      # 단위 테스트
    │   ├── services/              # 서비스 테스트
    │   ├── controllers/           # 컨트롤러 테스트
    │   └── models/                # 모델 테스트
    ├── integration/               # 통합 테스트
    │   ├── api/                   # API 테스트
    │   └── database/              # 데이터베이스 테스트
    └── performance/               # 성능 테스트
        ├── load/                  # 부하 테스트
        └── stress/                # 스트레스 테스트
```

## 스크립트 구조
```
C:\MyProject\scripts\
├── setup/                         # 초기 설정 스크립트
│   ├── install_dependencies.sh    # 의존성 설치
│   ├── setup_database.sh          # 데이터베이스 설정
│   └── setup_environment.sh       # 환경 설정
├── database/                      # 데이터베이스 스크립트
│   ├── migrations/                # 마이그레이션 스크립트
│   ├── seeds/                     # 시드 스크립트
│   └── backup/                    # 백업 스크립트
├── build/                         # 빌드 스크립트
│   ├── build_frontend.sh          # 프론트엔드 빌드
│   ├── build_backend.sh           # 백엔드 빌드
│   └── build_all.sh               # 전체 빌드
└── deploy/                        # 배포 스크립트
    ├── deploy_frontend.sh         # 프론트엔드 배포
    ├── deploy_backend.sh          # 백엔드 배포
    └── deploy_all.sh              # 전체 배포
```
