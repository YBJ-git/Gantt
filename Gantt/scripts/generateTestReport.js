const fs = require('fs');
const path = require('path');

// 프론트엔드 및 백엔드 테스트 결과 JSON 파일 경로
const frontendResultPath = path.join(__dirname, '../frontend/test-results.json');
const backendResultPath = path.join(__dirname, '../backend/test-results.json');

// 테스트 결과 읽기
const readResultFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    console.warn(`파일을 찾을 수 없습니다: ${filePath}`);
    return null;
  } catch (error) {
    console.error(`파일 읽기 오류: ${filePath}`, error);
    return null;
  }
};

const frontendResults = readResultFile(frontendResultPath) || {
  numTotalTests: 0,
  numPassedTests: 0,
  numFailedTests: 0,
  testResults: []
};

const backendResults = readResultFile(backendResultPath) || {
  numTotalTests: 0,
  numPassedTests: 0,
  numFailedTests: 0,
  testResults: []
};

// 보고서 작성
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    frontend: {
      total: frontendResults.numTotalTests || 0,
      passed: frontendResults.numPassedTests || 0,
      failed: frontendResults.numFailedTests || 0,
      coverage: frontendResults.coverageMap?.total || 'N/A'
    },
    backend: {
      total: backendResults.numTotalTests || 0,
      passed: backendResults.numPassedTests || 0,
      failed: backendResults.numFailedTests || 0,
      coverage: backendResults.coverageMap?.total || 'N/A'
    }
  },
  failures: {
    frontend: (frontendResults.testResults || [])
      .filter(result => result && result.status === 'failed')
      .map(result => ({
        testPath: result.name,
        failureMessages: result.message
      })),
    backend: (backendResults.testResults || [])
      .filter(result => result && result.status === 'failed')
      .map(result => ({
        testPath: result.name,
        failureMessages: result.message
      }))
  },
  performance: {
    apiResponseTimes: (backendResults.testResults || [])
      .filter(result => result && result.name && result.name.includes('performance'))
      .map(result => ({
        testName: result.name,
        duration: result.duration
      }))
  }
};

// 보고서 저장
const reportPath = path.join(__dirname, '../test-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

// HTML 보고서 생성
const htmlReport = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>통합 테스트 보고서</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .summary { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .summary-card { background: #f5f5f5; padding: 20px; border-radius: 5px; width: 45%; }
    .passed { color: green; }
    .failed { color: red; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    .chart-container { margin-top: 30px; margin-bottom: 30px; }
    .header { background-color: #4a90e2; color: white; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
    .header h1 { margin: 0; }
    .header p { margin-top: 10px; margin-bottom: 0; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>작업 부하체크 간트 차트 시스템 통합 테스트 보고서</h1>
      <p>생성 시간: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
      <div class="summary-card">
        <h2>프론트엔드 테스트 요약</h2>
        <p>총 테스트: ${report.summary.frontend.total}</p>
        <p class="passed">성공: ${report.summary.frontend.passed}</p>
        <p class="failed">실패: ${report.summary.frontend.failed}</p>
        <p>코드 커버리지: ${report.summary.frontend.coverage}%</p>
      </div>
      
      <div class="summary-card">
        <h2>백엔드 테스트 요약</h2>
        <p>총 테스트: ${report.summary.backend.total}</p>
        <p class="passed">성공: ${report.summary.backend.passed}</p>
        <p class="failed">실패: ${report.summary.backend.failed}</p>
        <p>코드 커버리지: ${report.summary.backend.coverage}%</p>
      </div>
    </div>
    
    <h2>실패한 테스트</h2>
    ${report.failures.frontend.length === 0 && report.failures.backend.length === 0 
      ? '<p>실패한 테스트가 없습니다.</p>' 
      : `
        <h3>프론트엔드</h3>
        ${report.failures.frontend.length === 0 
          ? '<p>실패한 테스트가 없습니다.</p>' 
          : `
            <table>
              <tr>
                <th>테스트 경로</th>
                <th>실패 메시지</th>
              </tr>
              ${report.failures.frontend.map(failure => `
                <tr>
                  <td>${failure.testPath}</td>
                  <td>${failure.failureMessages}</td>
                </tr>
              `).join('')}
            </table>
          `}
        
        <h3>백엔드</h3>
        ${report.failures.backend.length === 0 
          ? '<p>실패한 테스트가 없습니다.</p>' 
          : `
            <table>
              <tr>
                <th>테스트 경로</th>
                <th>실패 메시지</th>
              </tr>
              ${report.failures.backend.map(failure => `
                <tr>
                  <td>${failure.testPath}</td>
                  <td>${failure.failureMessages}</td>
                </tr>
              `).join('')}
            </table>
          `}
      `}
    
    <h2>API 성능 테스트 결과</h2>
    <table>
      <tr>
        <th>테스트 이름</th>
        <th>소요 시간 (ms)</th>
      </tr>
      ${report.performance.apiResponseTimes.map(perf => `
        <tr>
          <td>${perf.testName}</td>
          <td>${perf.duration}</td>
        </tr>
      `).join('')}
    </table>
    
    <div class="chart-container">
      <h2>성능 추이 차트</h2>
      <p>그래프가 렌더링 될 영역입니다. 실제 테스트 결과가 있을 때 차트가 표시됩니다.</p>
      <div id="performance-chart" style="width: 100%; height: 400px; background-color: #f5f5f5; display: flex; align-items: center; justify-content: center;">
        <p>테스트 결과 데이터가 없습니다.</p>
      </div>
    </div>
  </div>
  
  <script>
    // 테스트 결과가 있을 때 차트를 렌더링하는 스크립트가 들어갈 위치
    // 실제 데이터가 있을 때 Chart.js 등의 라이브러리를 사용하여 그래프 표시
  </script>
</body>
</html>
`;

// HTML 보고서 저장
const htmlReportPath = path.join(__dirname, '../test-report.html');
fs.writeFileSync(htmlReportPath, htmlReport);

console.log(`테스트 보고서가 생성되었습니다: ${reportPath}`);
console.log(`HTML 보고서가 생성되었습니다: ${htmlReportPath}`);
