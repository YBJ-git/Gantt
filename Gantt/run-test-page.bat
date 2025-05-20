@echo off
echo 작업 부하 최적화 시스템 테스트 페이지 준비 중...

cd frontend

echo 필요한 패키지 설치 중...
echo 이 과정은 몇 분 정도 소요될 수 있습니다...
call npm install --save react react-dom react-router-dom antd @ant-design/icons classnames date-fns redux react-redux
call npm install --save-dev react-scripts

echo.
echo 테스트 서버 시작 중...
call npm start

echo.
echo 오류가 발생한 경우 위의 메시지를 확인하세요.
pause
