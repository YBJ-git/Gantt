# 로그인 문제 해결 가이드

## 🔍 문제 분석
현재 로그인이 실패하는 이유:
1. **userRoutes가 비활성화됨**: `/users/login` API 엔드포인트가 작동하지 않음
2. **URL 불일치**: 환경변수와 실제 백엔드 URL이 다름
3. **CORS 설정 불일치**: 프론트엔드와 백엔드 간 CORS 설정 문제

## ✅ 해결된 문제
1. **userRoutes 활성화 완료**: `/backend/src/routes/index.js`에서 userRoutes 주석 해제

## 🔧 추가 설정 필요사항

### 1. Netlify 환경변수 수정
Netlify 대시보드에서 다음 환경변수를 수정하세요:

```
REACT_APP_API_URL = https://gantt-c1oh.onrender.com/api
```

**현재 설정이 `gantt-cloh`이면 `gantt-c1oh`로 변경**

### 2. Render 환경변수 수정
Render 대시보드에서 다음 환경변수를 확인/수정하세요:

```
CORS_ORIGIN = https://tubular-vacherin-352fde.netlify.app
FRONTEND_URL = https://tubular-vacherin-352fde.netlify.app
```

### 3. 정확한 URL 확인 방법
1. **백엔드 URL 확인**: Render 대시보드 → 서비스 → Settings → Domain
2. **프론트엔드 URL 확인**: Netlify 대시보드 → Site → Settings → Domain management

## 🚀 배포 후 확인 사항
1. 백엔드 헬스체크: `https://your-backend-url.onrender.com/api/health`
2. 프론트엔드 환경변수 테스트: `/env-test` 페이지 접속
3. 로그인 기능 테스트

## 📝 현재 수정된 파일
- `/backend/src/routes/index.js`: userRoutes와 taskRoutes 활성화

## ⚠️ 주의사항
- 환경변수 변경 후 반드시 서비스 재배포 필요
- CORS_ORIGIN과 FRONTEND_URL은 동일한 값으로 설정
- URL 끝에 슬래시(/) 없이 설정

## 🔄 재배포 순서
1. 백엔드 변경사항 Git 푸시 (자동 재배포)
2. Render에서 환경변수 수정 후 수동 재배포
3. Netlify에서 환경변수 수정 후 수동 재배포
4. 로그인 테스트
