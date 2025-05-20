#!/bin/bash
# 사용자 테스트 환경 설정 스크립트

# 필요한 환경 변수 설정
export NODE_ENV=test
export DB_SERVER=localhost
export DB_USER=sa
# DB_PASSWORD는 .env 파일이나 환경에서 설정해야 합니다
# export DB_PASSWORD=비밀번호를_여기에_입력하지_마세요
export PORT=3001

# 백엔드 서버 시작
echo "백엔드 서버를 시작합니다..."
cd backend
npm install
node src/scripts/setupTestDatabase.js
npm run dev &
BACKEND_PID=$!

# 프론트엔드 서버 시작
echo "프론트엔드 서버를 시작합니다..."
cd ../frontend
npm install
npm start &
FRONTEND_PID=$!

# 테스트 종료 시 프로세스 정리
cleanup() {
  echo "테스트 환경을 정리합니다..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit 0
}

# Ctrl+C 시그널 처리
trap cleanup SIGINT SIGTERM

echo "==================================================="
echo "사용자 테스트 환경이 준비되었습니다."
echo "프론트엔드: http://localhost:3000"
echo "백엔드 API: http://localhost:3001/api"
echo "==================================================="
echo "테스트를 종료하려면 Ctrl+C를 누르세요."

# 프로세스가 종료되지 않도록 대기
wait
