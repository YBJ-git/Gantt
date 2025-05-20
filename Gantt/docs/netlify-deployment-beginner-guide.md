# Netlify 배포 초보자 가이드

## 소개

이 가이드는 작업 부하체크 간트 차트 시스템을 Netlify에 배포하는 방법을 단계별로 안내합니다. 기술적 경험이 적은 사용자도 쉽게 따라할 수 있도록 작성되었습니다.

## 1. 사전 준비

### Netlify 계정 만들기
1. [Netlify 웹사이트](https://www.netlify.com/)로 이동합니다.
2. 오른쪽 상단의 "Sign up" 버튼을 클릭합니다.
3. GitHub, GitLab, Bitbucket 계정으로 가입하거나 이메일로 가입합니다.

### GitHub 계정 준비
1. [GitHub 웹사이트](https://github.com/)에서 계정이 없다면 가입합니다.
2. 프로젝트 저장소에 접근 권한이 있는지 확인합니다.

## 2. 프로젝트 설정

### 코드 다운로드
1. GitHub에서 저장소를 복제(Clone)합니다:
   ```
   git clone https://github.com/your-username/your-repository.git
   cd your-repository
   ```

### 환경 설정
1. Node.js 설치:
   - [Node.js 웹사이트](https://nodejs.org/)에서 LTS 버전 다운로드 및 설치

2. 프로젝트 설정:
   ```
   cd frontend
   npm install
   ```

## 3. Netlify CLI 설치 및 설정

1. 제공된 설정 스크립트 실행:
   - Windows: `scripts\setup-netlify.bat` 더블 클릭 또는 명령 프롬프트에서 실행
   - Mac/Linux: `bash scripts/setup-netlify.sh`

2. 브라우저 창이 열리면 Netlify 계정으로 로그인합니다.

## 4. 배포 방법

### 방법 1: 수동 배포 (가장 쉬운 방법)

1. 프론트엔드 디렉토리로 이동:
   ```
   cd frontend
   ```

2. 프로젝트 빌드:
   ```
   npm run build
   ```

3. Netlify에 배포:
   ```
   netlify deploy
   ```
   
4. 프롬프트에 다음과 같이 응답합니다:
   - 배포 경로: `build`
   
5. 미리보기 URL을 확인하고 문제가 없다면 프로덕션 배포:
   ```
   netlify deploy --prod
   ```

### 방법 2: GitHub 연동을 통한 자동 배포

1. Netlify 대시보드에 로그인합니다.
2. "New site from Git" 버튼을 클릭합니다.
3. GitHub를 선택하고 저장소 접근 권한을 부여합니다.
4. 프로젝트 저장소를 선택합니다.
5. 다음 설정을 입력합니다:
   - 빌드 명령어: `npm run build`
   - 게시 디렉토리: `build`
6. "Deploy site" 버튼을 클릭합니다.

## 5. 환경 변수 설정

1. Netlify 대시보드에서 사이트를 선택합니다.
2. "Site settings" 버튼을 클릭합니다.
3. 왼쪽 메뉴에서 "Build & deploy" > "Environment"를 선택합니다.
4. "Edit variables" 버튼을 클릭하고 필요한 환경 변수를 추가합니다:
   - `REACT_APP_API_URL`: 백엔드 API URL
   - `REACT_APP_VERSION`: 앱 버전
   - 기타 필요한 환경 변수들

## 6. 커스텀 도메인 설정 (선택사항)

1. Netlify 대시보드에서 사이트를 선택합니다.
2. "Domain settings"를 클릭합니다.
3. "Add custom domain" 버튼을 클릭합니다.
4. 도메인 이름을 입력하고 지시사항을 따릅니다.

## 7. 문제 해결

### 배포 실패 시
1. Netlify 대시보드에서 "Deploys" 탭을 확인합니다.
2. 실패한 배포를 클릭하고 로그를 확인합니다.
3. 일반적인 오류:
   - 빌드 명령어 오류: `netlify.toml` 파일의 빌드 명령어 확인
   - 종속성 오류: `package.json` 파일의 종속성 확인
   - 환경 변수 오류: 필요한 환경 변수가 설정되었는지 확인

### 로컬 테스트 방법
```
cd frontend
netlify dev
```

## 8. 도움이 필요하세요?

기술 지원이 필요한 경우 다음 연락처로 문의하세요:
- 이메일: support@yourcompany.com
- 내부 포털: IT 지원 티켓 시스템
