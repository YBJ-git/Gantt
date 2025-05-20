const fs = require('fs');
const path = require('path');

// 테스트 결과 파일이 저장될 디렉토리
const resultsDir = path.join(__dirname, '../test-results');

// 결과 분석 함수
async function analyzeResults() {
  try {
    // 디렉토리 확인 및 생성
    if (!fs.existsSync(resultsDir)) {
      console.log('테스트 결과 디렉토리가 존재하지 않습니다.');
      return;
    }
    
    // JSON 결과 파일들 읽기
    const files = fs.readdirSync(resultsDir).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('분석할 테스트 결과 파일이 없습니다.');
      return;
    }
    
    console.log(`${files.length}개의 테스트 결과 파일을 분석합니다...`);
    
    // 결과 집계를 위한 객체
    const results = {
      totalResponses: files.length,
      scenarios: {
        scenario1: { count: 0, ratings: { usability: 0, completeness: 0, performance: 0, design: 0 }},
        scenario2: { count: 0, ratings: { usability: 0, completeness: 0, performance: 0, design: 0 }},
        scenario3: { count: 0, ratings: { usability: 0, completeness: 0, performance: 0, design: 0 }},
        scenario4: { count: 0, ratings: { usability: 0, completeness: 0, performance: 0, design: 0 }},
        scenario5: { count: 0, ratings: { usability: 0, completeness: 0, performance: 0, design: 0 }}
      },
      bugs: [],
      improvements: [],
      features: []
    };
    
    // 각 파일 처리
    for (const file of files) {
      const filePath = path.join(resultsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const scenario = data.scenario;
      if (results.scenarios[scenario]) {
        results.scenarios[scenario].count++;
        results.scenarios[scenario].ratings.usability += parseInt(data.usability);
        results.scenarios[scenario].ratings.completeness += parseInt(data.completeness);
        results.scenarios[scenario].ratings.performance += parseInt(data.performance);
        results.scenarios[scenario].ratings.design += parseInt(data.design);
      }
      
      if (data.bugs && data.bugs.trim()) {
        results.bugs.push({
          scenario,
          description: data.bugs
        });
      }
      
      if (data.cons && data.cons.trim()) {
        results.improvements.push({
          scenario,
          description: data.cons
        });
      }
      
      if (data.features && data.features.trim()) {
        results.features.push({
          scenario,
          description: data.features
        });
      }
    }
    
    // 평균 계산
    for (const scenario in results.scenarios) {
      const count = results.scenarios[scenario].count;
      if (count > 0) {
        results.scenarios[scenario].ratings.usability /= count;
        results.scenarios[scenario].ratings.completeness /= count;
        results.scenarios[scenario].ratings.performance /= count;
        results.scenarios[scenario].ratings.design /= count;
      }
    }
    
    // 결과 저장
    const resultFile = path.join(__dirname, '../test-analysis-results.json');
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
    
    // HTML 보고서 생성
    generateHtmlReport(results);
    
    console.log(`분석 완료. 결과가 ${resultFile}에 저장되었습니다.`);
  } catch (error) {
    console.error('분석 중 오류 발생:', error);
  }
}

// HTML 보고서 생성 함수
function generateHtmlReport(results) {
  const scenarioNames = {
    scenario1: '시나리오 1: 새로운 작업 생성 및 할당',
    scenario2: '시나리오 2: 부하 최적화 도구 사용',
    scenario3: '시나리오 3: 보고서 생성 및 공유',
    scenario4: '시나리오 4: 알림 및 협업 기능 테스트',
    scenario5: '시나리오 5: 대시보드 기능 테스트'
  };
  
  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>사용자 테스트 결과 분석</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4a90e2;
      color: white;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .section {
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
    }
    .rating-bar {
      height: 20px;
      background-color: #4a90e2;
      border-radius: 10px;
    }
    .issues-list {
      list-style-type: none;
      padding: 0;
    }
    .issues-list li {
      margin-bottom: 15px;
      padding: 10px;
      background-color: #fff;
      border-left: 3px solid #4a90e2;
    }
    .scenario-tag {
      display: inline-block;
      padding: 3px 8px;
      background-color: #e2e2e2;
      border-radius: 3px;
      font-size: 0.8em;
      margin-right: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>작업 부하체크 간트 차트 시스템</h1>
    <p>사용자 테스트 결과 분석 보고서</p>
    <p>총 응답 수: ${results.totalResponses}</p>
  </div>
  
  <div class="section">
    <h2>시나리오별 평가</h2>
    <table>
      <tr>
        <th>시나리오</th>
        <th>응답 수</th>
        <th>사용 편의성</th>
        <th>기능 완성도</th>
        <th>응답 속도</th>
        <th>UI 디자인</th>
      </tr>
      ${Object.entries(results.scenarios).map(([key, data]) => `
      <tr>
        <td>${scenarioNames[key]}</td>
        <td>${data.count}</td>
        <td>
          ${data.count > 0 ? data.ratings.usability.toFixed(1) : 'N/A'}
          ${data.count > 0 ? `<div class="rating-bar" style="width: ${data.ratings.usability * 20}%"></div>` : ''}
        </td>
        <td>
          ${data.count > 0 ? data.ratings.completeness.toFixed(1) : 'N/A'}
          ${data.count > 0 ? `<div class="rating-bar" style="width: ${data.ratings.completeness * 20}%"></div>` : ''}
        </td>
        <td>
          ${data.count > 0 ? data.ratings.performance.toFixed(1) : 'N/A'}
          ${data.count > 0 ? `<div class="rating-bar" style="width: ${data.ratings.performance * 20}%"></div>` : ''}
        </td>
        <td>
          ${data.count > 0 ? data.ratings.design.toFixed(1) : 'N/A'}
          ${data.count > 0 ? `<div class="rating-bar" style="width: ${data.ratings.design * 20}%"></div>` : ''}
        </td>
      </tr>
      `).join('')}
    </table>
  </div>
  
  <div class="section">
    <h2>발견된 버그 (${results.bugs.length})</h2>
    ${results.bugs.length === 0 ? '<p>보고된 버그가 없습니다.</p>' : `
    <ul class="issues-list">
      ${results.bugs.map(bug => `
      <li>
        <span class="scenario-tag">${scenarioNames[bug.scenario]}</span>
        <p>${bug.description}</p>
      </li>
      `).join('')}
    </ul>
    `}
  </div>
  
  <div class="section">
    <h2>개선 요청 사항 (${results.improvements.length})</h2>
    ${results.improvements.length === 0 ? '<p>보고된 개선 요청 사항이 없습니다.</p>' : `
    <ul class="issues-list">
      ${results.improvements.map(improvement => `
      <li>
        <span class="scenario-tag">${scenarioNames[improvement.scenario]}</span>
        <p>${improvement.description}</p>
      </li>
      `).join('')}
    </ul>
    `}
  </div>
  
  <div class="section">
    <h2>요청된 새 기능 (${results.features.length})</h2>
    ${results.features.length === 0 ? '<p>요청된 새 기능이 없습니다.</p>' : `
    <ul class="issues-list">
      ${results.features.map(feature => `
      <li>
        <span class="scenario-tag">${scenarioNames[feature.scenario]}</span>
        <p>${feature.description}</p>
      </li>
      `).join('')}
    </ul>
    `}
  </div>
</body>
</html>
  `;
  
  const htmlFile = path.join(__dirname, '../test-analysis-results.html');
  fs.writeFileSync(htmlFile, html);
  console.log(`HTML 보고서가 ${htmlFile}에 생성되었습니다.`);
}

// 스크립트 실행
analyzeResults();
