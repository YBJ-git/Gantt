@echo off
echo 작업 부하 최적화 시스템 테스트 페이지 준비 중...

cd frontend

echo Node.js 및 npm 버전 확인:
node --version
npm --version

echo 필요한 패키지 설치 중...
echo 이 과정은 시간이 걸릴 수 있습니다. 창을 닫지 마세요...
call npm install

echo React 앱 시작 중...
call npm start

echo 오류가 발생했다면 아래 내용을 확인하세요.
echo.
echo 계속하려면 아무 키나 누르세요...
pause
