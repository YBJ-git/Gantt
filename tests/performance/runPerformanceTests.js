/**
 * 부하 최적화 API 성능 테스트 스크립트
 */
const artillery = require('artillery');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

// 서버 시작 함수
async function startServer() {
  console.log('Starting test server...');
  
  try {
    // 테스트용 서버 시작 (백그라운드로 실행)
    const serverProcess = require('child_process').spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '../../'),
      detached: true,
      stdio: 'ignore'
    });
    
    // 서버 PID 저장
    fs.writeFileSync(path.join(__dirname, 'server.pid'), serverProcess.pid.toString());
    
    // 서버가 시작될 때까지 대기
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`Test server started with PID: ${serverProcess.pid}`);
    return serverProcess.pid;
  } catch (error) {
    console.error('Failed to start test server:', error);
    throw error;
  }
}

// 서버 종료 함수
async function stopServer() {
  try {
    // 저장된 서버 PID 읽기
    const pidFile = path.join(__dirname, 'server.pid');
    if (fs.existsSync(pidFile)) {
      const pid = parseInt(fs.readFileSync(pidFile, 'utf8'), 10);
      
      // 프로세스 종료
      console.log(`Stopping test server with PID: ${pid}`);
      
      // Windows 환경에서는 taskkill 명령어 사용
      if (process.platform === 'win32') {
        await execAsync(`taskkill /pid ${pid} /f /t`);
      } else {
        // Unix/Linux/macOS 환경에서는 kill 명령어 사용
        process.kill(pid);
      }
      
      // PID 파일 삭제
      fs.unlinkSync(pidFile);
      console.log('Test server stopped');
    }
  } catch (error) {
    console.error('Failed to stop test server:', error);
  }
}

// 성능 테스트 실행 함수
async function runPerformanceTests() {
  try {
    // 테스트 시나리오 파일 경로
    const scenarioFile = path.join(__dirname, 'scenarios', 'load-optimization-performance.json');
    
    // 결과 디렉토리 생성
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }
    
    // 결과 파일 경로
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = path.join(resultsDir, `performance-results-${timestamp}.json`);
    
    console.log('Running performance tests...');
    console.log(`Scenario: ${scenarioFile}`);
    console.log(`Results will be saved to: ${resultsFile}`);
    
    // Artillery 테스트 실행
    const artilleryConfig = JSON.parse(fs.readFileSync(scenarioFile, 'utf8'));
    
    // Artillery 프로그래밍 방식으로 실행
    const result = await new Promise((resolve, reject) => {
      artillery.run(scenarioFile, {
        output: resultsFile,
        quiet: false
      })
      .then((stats) => {
        resolve(stats);
      })
      .catch((err) => {
        reject(err);
      });
    });
    
    // 테스트 결과 요약 출력
    console.log('Performance tests completed');
    console.log(`Results saved to: ${resultsFile}`);
    
    // 테스트 결과 분석
    const summary = {
      timestamp: new Date().toISOString(),
      totalRequests: result.report.counters['vusers.created'] || 0,
      successfulRequests: result.report.counters['vusers.completed'] || 0,
      failedRequests: result.report.counters['vusers.failed'] || 0,
      responseTimeMin: result.report.summaries['http.response_time']?.min || 0,
      responseTimeMax: result.report.summaries['http.response_time']?.max || 0,
      responseTimeMean: result.report.summaries['http.response_time']?.mean || 0,
      responseTimeMedian: result.report.summaries['http.response_time']?.median || 0,
      responseTime95th: result.report.summaries['http.response_time']?.p95 || 0,
      requestRate: result.report.summaries['vusers.created_rate']?.mean || 0,
      scenarioFile: scenarioFile,
      resultsFile: resultsFile
    };
    
    // 요약 결과 저장
    const summaryFile = path.join(resultsDir, `summary-${timestamp}.json`);
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    return summary;
  } catch (error) {
    console.error('Performance test error:', error);
    throw error;
  }
}

// 메인 함수
async function main() {
  let serverPid = null;
  
  try {
    // 테스트 서버 시작
    serverPid = await startServer();
    
    // 성능 테스트 실행
    const results = await runPerformanceTests();
    
    // 결과 출력
    console.log('Performance Test Summary:');
    console.log('--------------------------');
    console.log(`Total Requests: ${results.totalRequests}`);
    console.log(`Successful Requests: ${results.successfulRequests}`);
    console.log(`Failed Requests: ${results.failedRequests}`);
    console.log(`Response Time (min): ${results.responseTimeMin} ms`);
    console.log(`Response Time (max): ${results.responseTimeMax} ms`);
    console.log(`Response Time (mean): ${results.responseTimeMean} ms`);
    console.log(`Response Time (median): ${results.responseTimeMedian} ms`);
    console.log(`Response Time (95th percentile): ${results.responseTime95th} ms`);
    console.log(`Request Rate: ${results.requestRate} req/sec`);
    
    // 성능 기준 평가
    console.log('\nPerformance Evaluation:');
    console.log('----------------------');
    
    // 응답 시간 평가
    if (results.responseTime95th < 200) {
      console.log('✅ Response Time: Excellent (95th percentile < 200ms)');
    } else if (results.responseTime95th < 500) {
      console.log('✅ Response Time: Good (95th percentile < 500ms)');
    } else if (results.responseTime95th < 1000) {
      console.log('⚠️ Response Time: Acceptable (95th percentile < 1000ms)');
    } else {
      console.log('❌ Response Time: Poor (95th percentile >= 1000ms)');
    }
    
    // 요청 성공률 평가
    const successRate = (results.successfulRequests / results.totalRequests) * 100;
    if (successRate > 99) {
      console.log('✅ Success Rate: Excellent (>99%)');
    } else if (successRate > 95) {
      console.log('✅ Success Rate: Good (>95%)');
    } else if (successRate > 90) {
      console.log('⚠️ Success Rate: Acceptable (>90%)');
    } else {
      console.log('❌ Success Rate: Poor (<=90%)');
    }
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  } finally {
    // 테스트 서버 종료
    if (serverPid) {
      await stopServer();
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
}

module.exports = {
  startServer,
  stopServer,
  runPerformanceTests
};
