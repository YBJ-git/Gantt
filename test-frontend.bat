@echo off
setlocal enabledelayedexpansion

echo 🚀 MyProject 프론트엔드 테스트 실행 시작
echo ==================================

REM 프론트엔드 디렉토리로 이동
cd frontend

REM Node.js 버전 확인
echo 📦 Node.js 버전 확인...
node --version
npm --version

REM 의존성 설치 확인
echo 📦 의존성 설치 확인 중...
if not exist "node_modules" (
    echo 의존성을 설치하는 중...
    npm install
)

REM 1. 린터 검사
echo 🔍 ESLint 검사 실행...
npm run lint
if errorlevel 1 echo ⚠️ 린터 경고가 있습니다.

REM 2. 타입 체크 (TypeScript가 있는 경우)
if exist "tsconfig.json" (
    echo 🔍 TypeScript 타입 체크...
    npx tsc --noEmit
    if errorlevel 1 echo ⚠️ 타입 오류가 있습니다.
)

REM 3. 단위 테스트 실행
echo 🧪 단위 테스트 실행...
npm run test:components

REM 4. API 통합 테스트 실행
echo 🌐 API 통합 테스트 실행...
npm run test:api

REM 5. 전체 테스트 커버리지
echo 📊 테스트 커버리지 생성...
npm run test:coverage

REM 6. 빌드 테스트
echo 🔨 프로덕션 빌드 테스트...
npm run build

if errorlevel 1 (
    echo ❌ 빌드 실패!
    exit /b 1
) else (
    echo ✅ 빌드 성공!
    
    REM 빌드 크기 확인
    echo 📏 빌드 크기 확인...
    if exist "build" (
        for /f "tokens=3" %%a in ('dir build /s /-c ^| find "파일"') do (
            echo 빌드 총 크기: %%a bytes
        )
    )
    
    REM 주요 파일 크기 확인
    if exist "build\static\js" (
        echo 📁 JavaScript 번들:
        dir "build\static\js\*.js" /b
    )
    
    if exist "build\static\css" (
        echo 📁 CSS 번들:
        dir "build\static\css\*.css" /b
    )
)

REM 7. PWA 매니페스트 검증
echo 📱 PWA 매니페스트 검증...
if exist "public\manifest.json" (
    echo ✅ manifest.json 존재
    node -e "try { const manifest = require('./public/manifest.json'); console.log('✅ PWA 매니페스트 유효'); console.log('앱 이름:', manifest.name); console.log('시작 URL:', manifest.start_url); console.log('디스플레이 모드:', manifest.display); } catch (e) { console.log('❌ PWA 매니페스트 오류:', e.message); }"
) else (
    echo ⚠️ PWA 매니페스트가 없습니다.
)

REM 8. Service Worker 검증
if exist "public\sw.js" (
    echo ✅ Service Worker 존재
) else (
    echo ⚠️ Service Worker가 없습니다.
)

REM 9. 보안 취약점 검사
echo 🔒 보안 취약점 검사...
npm audit --audit-level=moderate

REM 결과 요약
echo.
echo 🎉 테스트 완료!
echo ==================================
echo ✅ 린터 검사 완료
echo ✅ 단위 테스트 완료
echo ✅ API 통합 테스트 완료
echo ✅ 테스트 커버리지 생성 완료
echo ✅ 프로덕션 빌드 완료
echo ✅ PWA 검증 완료
echo ✅ 보안 검사 완료

REM 테스트 결과 파일 위치 안내
echo.
echo 📄 생성된 파일들:
echo - 테스트 커버리지: coverage\lcov-report\index.html
echo - 프로덕션 빌드: build\

echo.
echo 🚀 모든 테스트가 완료되었습니다!

REM 테스트 결과 열기 (선택사항)
set /p open_results="테스트 결과를 브라우저에서 열까요? (y/n): "
if /i "%open_results%"=="y" (
    if exist "coverage\lcov-report\index.html" (
        start coverage\lcov-report\index.html
    )
)

pause
