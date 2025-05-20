#!/bin/bash
echo "작업 부하 최적화 시스템 테스트 페이지 준비 중..."

cd frontend

echo "필요한 패키지 설치 중..."
npm install --save react react-dom react-router-dom antd @ant-design/icons classnames date-fns redux react-redux

echo "테스트 서버 시작 중..."
npm start
