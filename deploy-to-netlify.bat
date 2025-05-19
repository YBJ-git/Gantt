@echo off
echo ========================================
echo 작업 부하체크 간트 차트 시스템 - Netlify 배포
echo ========================================

:: Node.js 및 npm 확인
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js가 설치되어 있지 않습니다. 먼저 Node.js를 설치해주세요.
    exit /b 1
)

:: Netlify CLI 확인
where netlify >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Netlify CLI가 설치되어 있지 않습니다. 설치 중...
    call npm install -g netlify-cli
)

:: 프론트엔드 디렉토리로 이동
cd frontend

:: 환경 변수 파일 복사
echo 환경 변수 설정 중...
copy .env.production .env 2>nul

:: 종속성 설치
echo 프론트엔드 종속성 설치 중...
call npm install --legacy-peer-deps

:: 빌드
echo 프로젝트 빌드 중...
set CI=false
call npm run build

:: _redirects 파일 확인
echo /* /index.html 200 > build\_redirects

:: Netlify에 배포
echo Netlify에 배포 중...
call netlify deploy --prod

echo ========================================
echo 배포가 완료되었습니다!
echo ========================================

:: 루트 디렉토리로 돌아가기
cd ..

pause
