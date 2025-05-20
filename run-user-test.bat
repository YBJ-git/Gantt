@echo off
rem 사용자 테스트 환경 설정 스크립트 (Windows용)

rem 필요한 환경 변수 설정
set NODE_ENV=test
set DB_SERVER=localhost
set DB_USER=sa
rem DB_PASSWORD는 .env 파일이나 환경에서 설정해야 합니다
rem set DB_PASSWORD=비밀번호를_여기에_입력하지_마세요
set PORT=3001

echo 백엔드 서버를 시작합니다...
cd backend
call npm install
node src/scripts/setupTestDatabase.js
start npm run dev

echo 프론트엔드 서버를 시작합니다...
cd ../frontend
call npm install
start npm start

echo ===================================================
echo 사용자 테스트 환경이 준비되었습니다.
echo 프론트엔드: http://localhost:3000
echo 백엔드 API: http://localhost:3001/api
echo ===================================================
echo 서버를 종료하려면 각 콘솔 창을 닫으세요.

pause
