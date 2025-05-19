const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 결과 디렉토리 생성
const resultsDir = path.join(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// 현재 시간을 기반으로 한 파일명 생성
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const outputFile = path.join(resultsDir, `load-test-report-${timestamp}.json`);
const htmlReport = path.join(resultsDir, `load-test-report-${timestamp}.html`);

console.log('Starting load tests...');

// Artillery 실행
const artilleryCommand = `npx artillery run artillery-workload-test.yml --output ${outputFile}`;

exec(artilleryCommand, { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error running load tests: ${error.message}`);
    return;
  }
  
  console.log(stdout);
  
  if (stderr) {
    console.error(`Artillery stderr: ${stderr}`);
  }
  
  console.log('Load tests completed. Generating HTML report...');
  
  // HTML 보고서 생성
  const reportCommand = `npx artillery report --output ${htmlReport} ${outputFile}`;
  
  exec(reportCommand, { cwd: __dirname }, (reportError, reportStdout, reportStderr) => {
    if (reportError) {
      console.error(`Error generating report: ${reportError.message}`);
      return;
    }
    
    console.log(reportStdout);
    
    if (reportStderr) {
      console.error(`Report stderr: ${reportStderr}`);
    }
    
    console.log(`Load test completed. HTML report saved to: ${htmlReport}`);
  });
});