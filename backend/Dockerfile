# 백엔드 Dockerfile
FROM node:16-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 앱 종속성 설치
COPY package*.json ./
RUN npm ci --only=production

# 앱 소스 복사
COPY . .

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3001

# 포트 노출
EXPOSE 3001

# 앱 실행
CMD ["node", "src/app.js"]
