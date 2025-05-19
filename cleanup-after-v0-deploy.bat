@echo off
echo ===================================================
echo   작업 부하 최적화 시스템 v0 배포 후 환경 정리 도구
echo ===================================================

echo [1/3] 배포 상태 확인 중...
call v0 status
if %errorlevel% neq 0 (
  echo v0 상태 확인에 실패했습니다.
  exit /b 1
)

echo [2/3] 환경 변수 파일 원복 중...
echo 원본 환경 변수 파일로 복원합니다...
copy /Y "frontend\.env.production.example" "frontend\.env.production"
copy /Y "backend\.env.production.example" "backend\.env.production"
echo 환경 변수 파일이 복원되었습니다.

echo [3/3] 로컬 캐시 정리 중...
echo 불필요한 임시 파일을 정리합니다...
rmdir /s /q ".v0" 2>nul
echo 정리가 완료되었습니다.

echo 모든 작업이 완료되었습니다. v0 배포 URL을 메모해 두세요.
pause
