#!/bin/bash
# Netlify CLI 설치 및 셋업 스크립트

echo "========================================"
echo "작업 부하체크 간트 차트 시스템 - Netlify 셋업"
echo "========================================"

# Node.js 및 npm 확인
if ! command -v node &> /dev/null; then
    echo "Node.js가 설치되어 있지 않습니다. 먼저 Node.js를 설치해주세요."
    exit 1
fi

# Netlify CLI 전역 설치
echo "Netlify CLI 설치 중..."
npm install -g netlify-cli

# 설치 확인
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI 설치에 실패했습니다. 수동으로 설치해주세요: npm install -g netlify-cli"
    exit 1
fi

echo "Netlify CLI가 성공적으로 설치되었습니다."

# 프로젝트 디렉토리로 이동
cd ../frontend

# 종속성 설치
echo "프론트엔드 종속성 설치 중..."
npm install

# Netlify 로그인
echo "Netlify 계정에 로그인합니다. 브라우저 창이 열릴 것입니다."
netlify login

# 사이트 연결
echo "프로젝트를 Netlify 사이트에 연결합니다."
netlify link

echo "========================================"
echo "설정이 완료되었습니다!"
echo "개발 서버를 시작하려면: netlify dev"
echo "수동으로 배포하려면: netlify deploy"
echo "========================================"
