#!/bin/bash

echo "==================================================="
echo "      작업 부하 최적화 시스템 v0 배포 스크립트"
echo "==================================================="

echo "[1/5] v0 CLI 설치 확인 중..."
if ! npm list -g v0 &>/dev/null; then
  echo "v0 CLI가 설치되어 있지 않습니다. 설치합니다..."
  npm install -g v0
  if [ $? -ne 0 ]; then
    echo "v0 CLI 설치에 실패했습니다."
    exit 1
  fi
fi
echo "v0 CLI가 준비되었습니다."

echo "[2/5] v0에 로그인 중..."
v0 login
if [ $? -ne 0 ]; then
  echo "v0 로그인에 실패했습니다."
  exit 1
fi
echo "v0에 로그인했습니다."

echo "[3/5] 환경 변수 파일 준비 중..."
cp -f frontend/.env.production.v0 frontend/.env.production
cp -f backend/.env.production.v0 backend/.env.production
echo "환경 변수 파일이 준비되었습니다."

echo "[4/5] v0 초기화 및 배포 준비 중..."
v0 init --yes
if [ $? -ne 0 ]; then
  echo "v0 초기화에 실패했습니다."
  exit 1
fi
echo "v0 초기화를 완료했습니다."

echo "[5/5] v0에 배포 중..."
v0 deploy
if [ $? -ne 0 ]; then
  echo "v0 배포에 실패했습니다."
  exit 1
fi
echo "작업 부하 최적화 시스템이 v0에 성공적으로 배포되었습니다!"
echo "배포된 URL을 확인하세요."

read -p "계속하려면 아무 키나 누르세요..."
