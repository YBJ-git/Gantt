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
    echo Netlify CLI가 설치되어 있지 않습니다. 먼저 'scripts\setup-netlify.bat'를 실행해주세요.
    exit /b 1
)

:: 프론트엔드 디렉토리로 이동
cd frontend

:: 환경 변수 파일 복사
echo 환경 변수 설정 중...
copy .env.production .env

:: 종속성 설치
echo 프론트엔드 종속성 설치 중...
call npm install

:: 테스트 실행
echo 테스트 실행 중...
call npm test

:: 빌드
echo 프로젝트 빌드 중...
call npm run build

:: Netlify 배포
echo Netlify에 배포 중...
call netlify deploy --prod

echo ========================================
echo 프론트엔드 배포가 완료되었습니다!
echo ========================================

:: 루트 디렉토리로 돌아가기
cd ..

echo 백엔드는 Render 대시보드에서 수동으로 배포하거나 
echo GitHub 저장소를 연결하여 자동 배포를 설정하세요.
echo Render 대시보드: https://dashboard.render.com

pause
