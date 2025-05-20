@echo off
echo ===================================================
echo       작업 부하 최적화 시스템 v0 배포 스크립트
echo ===================================================

echo [1/5] v0 CLI 설치 확인 중...
call npm list -g v0 >nul 2>&1
if %errorlevel% neq 0 (
  echo v0 CLI가 설치되어 있지 않습니다. 설치합니다...
  call npm install -g v0
  if %errorlevel% neq 0 (
    echo v0 CLI 설치에 실패했습니다.
    exit /b 1
  )
)
echo v0 CLI가 준비되었습니다.

echo [2/5] v0에 로그인 중...
call v0 login
if %errorlevel% neq 0 (
  echo v0 로그인에 실패했습니다.
  exit /b 1
)
echo v0에 로그인했습니다.

echo [3/5] 환경 변수 파일 준비 중...
copy /Y "frontend\.env.production.v0" "frontend\.env.production"
copy /Y "backend\.env.production.v0" "backend\.env.production"
echo 환경 변수 파일이 준비되었습니다.

echo [4/5] v0 초기화 및 배포 준비 중...
call v0 init --yes
if %errorlevel% neq 0 (
  echo v0 초기화에 실패했습니다.
  exit /b 1
)
echo v0 초기화를 완료했습니다.

echo [5/5] v0에 배포 중...
call v0 deploy
if %errorlevel% neq 0 (
  echo v0 배포에 실패했습니다.
  exit /b 1
)
echo 작업 부하 최적화 시스템이 v0에 성공적으로 배포되었습니다!
echo 배포된 URL을 확인하세요.

pause
