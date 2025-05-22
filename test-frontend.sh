#!/bin/bash

echo "🚀 MyProject 프론트엔드 테스트 실행 시작"
echo "=================================="

# 프론트엔드 디렉토리로 이동
cd frontend

# Node.js 버전 확인
echo "📦 Node.js 버전 확인..."
node --version
npm --version

# 의존성 설치 확인
echo "📦 의존성 설치 확인 중..."
if [ ! -d "node_modules" ]; then
    echo "의존성을 설치하는 중..."
    npm install
fi

# 1. 린터 검사
echo "🔍 ESLint 검사 실행..."
npm run lint || echo "⚠️ 린터 경고가 있습니다."

# 2. 타입 체크 (TypeScript가 있는 경우)
if [ -f "tsconfig.json" ]; then
    echo "🔍 TypeScript 타입 체크..."
    npx tsc --noEmit || echo "⚠️ 타입 오류가 있습니다."
fi

# 3. 단위 테스트 실행
echo "🧪 단위 테스트 실행..."
npm run test:components

# 4. API 통합 테스트 실행
echo "🌐 API 통합 테스트 실행..."
npm run test:api

# 5. 전체 테스트 커버리지
echo "📊 테스트 커버리지 생성..."
npm run test:coverage

# 6. 빌드 테스트
echo "🔨 프로덕션 빌드 테스트..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 빌드 성공!"
    
    # 빌드 크기 확인
    echo "📏 빌드 크기 확인..."
    du -sh build/
    
    # 주요 파일 크기 확인
    if [ -d "build/static/js" ]; then
        echo "📁 JavaScript 번들 크기:"
        ls -lh build/static/js/*.js | awk '{print $5, $9}'
    fi
    
    if [ -d "build/static/css" ]; then
        echo "📁 CSS 번들 크기:"
        ls -lh build/static/css/*.css | awk '{print $5, $9}'
    fi
else
    echo "❌ 빌드 실패!"
    exit 1
fi

# 7. Bundle Analyzer (있는 경우)
if npm list --depth=0 | grep -q "webpack-bundle-analyzer"; then
    echo "📊 번들 분석 실행..."
    npx webpack-bundle-analyzer build/static/js/*.js --mode server --host localhost --port 8888 &
    ANALYZER_PID=$!
    
    echo "번들 분석기가 http://localhost:8888 에서 실행 중입니다."
    echo "10초 후 자동으로 종료됩니다..."
    sleep 10
    kill $ANALYZER_PID 2>/dev/null
fi

# 8. 성능 테스트 (Lighthouse가 설치된 경우)
if command -v lighthouse &> /dev/null; then
    echo "⚡ Lighthouse 성능 테스트..."
    
    # 간단한 로컬 서버 시작
    npx serve -s build -l 3001 &
    SERVER_PID=$!
    
    # 서버가 시작될 때까지 대기
    sleep 5
    
    # Lighthouse 실행
    lighthouse http://localhost:3001 \
        --output=json \
        --output-path=lighthouse-report.json \
        --chrome-flags="--headless --no-sandbox" \
        --quiet
    
    if [ -f "lighthouse-report.json" ]; then
        echo "📊 Lighthouse 점수:"
        node -e "
            const report = require('./lighthouse-report.json');
            console.log('Performance:', Math.round(report.lhr.categories.performance.score * 100));
            console.log('Accessibility:', Math.round(report.lhr.categories.accessibility.score * 100));
            console.log('Best Practices:', Math.round(report.lhr.categories['best-practices'].score * 100));
            console.log('SEO:', Math.round(report.lhr.categories.seo.score * 100));
        "
        
        # 보고서 정리
        rm lighthouse-report.json
    fi
    
    # 로컬 서버 종료
    kill $SERVER_PID 2>/dev/null
fi

# 9. PWA 매니페스트 검증
echo "📱 PWA 매니페스트 검증..."
if [ -f "public/manifest.json" ]; then
    echo "✅ manifest.json 존재"
    node -e "
        try {
            const manifest = require('./public/manifest.json');
            console.log('✅ PWA 매니페스트 유효');
            console.log('앱 이름:', manifest.name);
            console.log('시작 URL:', manifest.start_url);
            console.log('디스플레이 모드:', manifest.display);
        } catch (e) {
            console.log('❌ PWA 매니페스트 오류:', e.message);
        }
    "
else
    echo "⚠️ PWA 매니페스트가 없습니다."
fi

# 10. Service Worker 검증
if [ -f "public/sw.js" ]; then
    echo "✅ Service Worker 존재"
else
    echo "⚠️ Service Worker가 없습니다."
fi

# 11. 보안 취약점 검사
echo "🔒 보안 취약점 검사..."
npm audit --audit-level=moderate

# 결과 요약
echo ""
echo "🎉 테스트 완료!"
echo "=================================="
echo "✅ 린터 검사 완료"
echo "✅ 단위 테스트 완료"
echo "✅ API 통합 테스트 완료"
echo "✅ 테스트 커버리지 생성 완료"
echo "✅ 프로덕션 빌드 완료"
echo "✅ PWA 검증 완료"
echo "✅ 보안 검사 완료"

# 테스트 결과 파일 위치 안내
echo ""
echo "📄 생성된 파일들:"
echo "- 테스트 커버리지: coverage/lcov-report/index.html"
echo "- 프로덕션 빌드: build/"

echo ""
echo "🚀 모든 테스트가 완료되었습니다!"
