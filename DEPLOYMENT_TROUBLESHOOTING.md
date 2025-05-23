# 배포 문제 해결 가이드

## 일반적인 배포 문제와 해결책

### 1. Render 백엔드 포트 문제
**문제**: Render에서 백엔드가 포트 5000에서 실행되고 있다고 로그에 표시되지만, 실제로는 외부에서 포트 번호로 접근할 수 없습니다.

**해결책**:
- Render는 자동으로 `PORT` 환경 변수를 제공합니다
- 외부에서는 HTTPS (포트 443)로만 접근 가능합니다
- 프론트엔드에서 API URL 설정 시 포트 번호를 포함하지 마세요
  - ❌ 잘못됨: `https://your-app.onrender.com:5000/api`
  - ✅ 올바름: `https://your-app.onrender.com/api`

### 2. CORS 오류
**문제**: 프론트엔드에서 백엔드 API 호출 시 CORS 오류 발생

**해결책**:
1. 백엔드 환경 변수에 `CORS_ORIGIN` 설정
   ```
   CORS_ORIGIN=https://your-app.netlify.app,http://localhost:3000
   ```
2. 여러 도메인을 쉼표로 구분하여 추가 가능
3. 개발 환경에서는 자동으로 모든 origin 허용

### 3. API 연결 실패
**문제**: 프론트엔드가 백엔드 API에 연결할 수 없음

**해결책**:
1. Netlify 환경 변수 확인
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```
2. URL 끝에 `/api` 포함 확인
3. HTTPS 프로토콜 사용 확인

### 4. React Router 404 오류
**문제**: 새로고침 시 또는 직접 URL 접근 시 404 오류

**해결책**:
- `frontend/public/_redirects` 파일 확인
  ```
  /* /index.html 200
  ```

### 5. WebSocket 연결 실패
**문제**: WebSocket 연결이 작동하지 않음

**해결책**:
- Render는 WebSocket을 지원하지만 별도 설정이 필요할 수 있습니다
- 필요시 WebSocket 전용 서비스 사용 고려

## 배포 전 체크리스트

### 백엔드 (Render)
- [ ] PostgreSQL 데이터베이스 생성 및 연결
- [ ] 환경 변수 설정 완료
  - [ ] DB_TYPE=postgres
  - [ ] POSTGRES_* 변수들
  - [ ] NODE_ENV=production
  - [ ] CORS_ORIGIN (프론트엔드 도메인 포함)
  - [ ] JWT_SECRET
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Auto-Deploy 활성화

### 프론트엔드 (Netlify)
- [ ] 환경 변수 설정 완료
  - [ ] REACT_APP_API_URL (포트 번호 없이!)
- [ ] Build Command: `npm run build`
- [ ] Publish Directory: `build`
- [ ] _redirects 파일 존재 확인
- [ ] Auto-Deploy 활성화

## 디버깅 팁

### 1. 네트워크 요청 확인
브라우저 개발자 도구에서:
- Network 탭에서 실패한 요청 확인
- Console 탭에서 에러 메시지 확인
- 요청 URL이 올바른지 확인

### 2. 환경 변수 확인
프론트엔드 콘솔에서:
```javascript
console.log(process.env.REACT_APP_API_URL)
```

### 3. CORS 에러 상세 확인
- 브라우저 콘솔의 전체 에러 메시지 확인
- 백엔드 로그에서 CORS 관련 메시지 확인

### 4. 배포 로그 확인
- Render: Dashboard > Logs
- Netlify: Deploys > 특정 배포 클릭 > Deploy log

## 추가 리소스
- [Render 문서](https://render.com/docs)
- [Netlify 문서](https://docs.netlify.com)
- [Create React App 배포 가이드](https://create-react-app.dev/docs/deployment/)
