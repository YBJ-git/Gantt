# 프론트엔드 Dockerfile
FROM node:16-alpine as build

# 작업 디렉토리 설정
WORKDIR /app

# 앱 종속성 설치
COPY package*.json ./
RUN npm ci

# 앱 소스 복사
COPY . .

# 앱 빌드
RUN npm run build

# 프로덕션 환경
FROM nginx:stable-alpine

# 빌드 결과물 복사
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
