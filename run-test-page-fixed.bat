@echo off
echo 작업 부하 최적화 시스템 테스트 페이지 준비 중...

cd frontend

echo 필요한 패키지 설치 중...
echo 이 과정은 시간이 걸릴 수 있습니다. 창을 닫지 마세요...
npm install --save react-scripts

echo 테스트 서버 시작 중...
npm start

pause
