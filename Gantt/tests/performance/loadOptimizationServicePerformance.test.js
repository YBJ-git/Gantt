/**
 * 부하 최적화 서비스 성능 테스트
 */
const loadOptimizationService = require('../../backend/src/services/loadOptimizationService');
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

// 성능 측정 결과 저장 디렉토리
const RESULTS_DIR = path.join(__dirname, 'results');
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// 테스트 데이터 생성 유틸리티
function generateTestData(resourceCount, taskCount, dayCount) {
  // 테스트용 리소스 생성
  const resources = Array.from({ length: resourceCount }, (_, i) => ({
    id: `resource-${i + 1}`,
    name: `리소스 ${i + 1}`,
    type: i % 3 === 0 ? 'DEVELOPER' : i % 3 === 1 ? 'DESIGNER' : 'TESTER',
    capacity: 8,
    dailyCapacity: 8,
    skills: Array.from({ length: 3 }, (_, j) => `skill-${j + 1 + (i % 5)}`)
  }));
  
  // 시작일과 종료일 설정
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-01-01');
  endDate.setDate(endDate.getDate() + dayCount - 1);
  
  // 테스트용 작업 생성
  const tasks = Array.from({ length: taskCount }, (_, i) => {
    // 작업 기간은 1~7일 사이로 랜덤 생성
    const taskStartDay = Math.floor(Math.random() * (dayCount - 7));
    const taskDuration = Math.floor(Math.random() * 7) + 1;
    
    const taskStartDate = new Date(startDate);
    taskStartDate.setDate(taskStartDate.getDate() + taskStartDay);
    
    const taskEndDate = new Date(taskStartDate);
    taskEndDate.setDate(taskEndDate.getDate() + taskDuration - 1);
    
    // 리소스 ID는 랜덤하게 할당
    const resourceIndex = Math.floor(Math.random() * resourceCount);
    
    return {
      id: `task-${i + 1}`,
      name: `작업 ${i + 1}`,
      startDate: taskStartDate.toISOString().split('T')[0],
      endDate: taskEndDate.toISOString().split('T')[0],
      effort: Math.floor(Math.random() * 40) + 8, // 8~48시간 사이의 작업량
      priority: Math.random() < 0.2 ? 'HIGH' : Math.random() < 0.6 ? 'MEDIUM' : 'LOW',
      resourceId: resources[resourceIndex].id,
      resourceType: resources[resourceIndex].type,
      requiredSkills: resources[resourceIndex].skills.slice(0, Math.floor(Math.random() * 3) + 1),
      isFixed: Math.random() < 0.3 // 30% 확률로 고정 작업
    };
  });
  
  // 프로젝트 및 팀 ID
  const projectId = 'project-perf-test';
  const teamId = 'team-perf-test';
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    resources,
    tasks,
    projectId,
    teamId
  };
}

// 성능 테스트 함수
async function runPerformanceTest(testName, fn, ...args) {
  console.log(`Running performance test: ${testName}`);
  
  const iterations = 5; // 각 테스트 반복 횟수
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    // 가비지 컬렉션 유도 (정확한 측정을 위해)
    if (global.gc) {
      global.gc();
    }
    
    console.log(`  Iteration ${i + 1}/${iterations}`);
    
    const start = performance.now();
    try {
      await fn(...args);
      const end = performance.now();
      const executionTime = end - start;
      results.push(executionTime);
      console.log(`    Execution time: ${executionTime.toFixed(2)} ms`);
    } catch (error) {
      console.error(`    Error: ${error.message}`);
      results.push(null);
    }
  }
  
  // 유효한 결과만 필터링
  const validResults = results.filter(result => result !== null);
  
  // 결과 분석
  const summary = {
    testName,
    timestamp: new Date().toISOString(),
    iterations,
    successfulIterations: validResults.length,
    min: Math.min(...validResults),
    max: Math.max(...validResults),
    mean: validResults.reduce((sum, val) => sum + val, 0) / validResults.length,
    median: getMedian(validResults)
  };
  
  console.log(`  Test completed: ${testName}`);
  console.log(`    Min: ${summary.min.toFixed(2)} ms`);
  console.log(`    Max: ${summary.max.toFixed(2)} ms`);
  console.log(`    Mean: ${summary.mean.toFixed(2)} ms`);
  console.log(`    Median: ${summary.median.toFixed(2)} ms`);
  
  // 결과 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(RESULTS_DIR, `performance-${testName.replace(/\s+/g, '-')}-${timestamp}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify({
    summary,
    rawResults: results
  }, null, 2));
  
  console.log(`  Results saved to: ${resultsFile}`);
  
  return summary;
}

// 중앙값 계산 함수
function getMedian(values) {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const midIndex = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[midIndex - 1] + sorted[midIndex]) / 2;
  } else {
    return sorted[midIndex];
  }
}

// 모든 성능 테스트 실행
async function runAllPerformanceTests() {
  console.log('Starting load optimization service performance tests...');
  
  // 다양한 규모의 테스트 데이터
  const smallTestData = generateTestData(10, 50, 30);    // 10명 리소스, 50개 작업, 30일
  const mediumTestData = generateTestData(30, 200, 60);  // 30명 리소스, 200개 작업, 60일
  const largeTestData = generateTestData(100, 1000, 90); // 100명 리소스, 1000개 작업, 90일
  
  // 성능 테스트 결과
  const results = [];
  
  // 1. 부하 데이터 조회 성능 테스트
  results.push(await runPerformanceTest(
    'getLoadData_small',
    loadOptimizationService.getLoadData.bind(loadOptimizationService),
    smallTestData.startDate,
    smallTestData.endDate,
    smallTestData.projectId,
    smallTestData.teamId
  ));
  
  results.push(await runPerformanceTest(
    'getLoadData_medium',
    loadOptimizationService.getLoadData.bind(loadOptimizationService),
    mediumTestData.startDate,
    mediumTestData.endDate,
    mediumTestData.projectId,
    mediumTestData.teamId
  ));
  
  // 2. 리소스별 부하 분석 성능 테스트
  const smallResourceIds = smallTestData.resources.map(r => r.id);
  results.push(await runPerformanceTest(
    'getResourceLoad_small',
    loadOptimizationService.getResourceLoad.bind(loadOptimizationService),
    smallResourceIds,
    smallTestData.startDate,
    smallTestData.endDate
  ));
  
  const mediumResourceIds = mediumTestData.resources.map(r => r.id);
  results.push(await runPerformanceTest(
    'getResourceLoad_medium',
    loadOptimizationService.getResourceLoad.bind(loadOptimizationService),
    mediumResourceIds,
    mediumTestData.startDate,
    mediumTestData.endDate
  ));
  
  // 3. 부하 최적화 추천 성능 테스트
  results.push(await runPerformanceTest(
    'getLoadOptimizationRecommendations_small',
    loadOptimizationService.getLoadOptimizationRecommendations.bind(loadOptimizationService),
    smallTestData.projectId,
    smallTestData.teamId,
    smallTestData.startDate,
    smallTestData.endDate,
    80 // 임계값
  ));
  
  // 4. 작업 자동 재분배 성능 테스트
  results.push(await runPerformanceTest(
    'autoDistributeTasks_small',
    loadOptimizationService.autoDistributeTasks.bind(loadOptimizationService),
    smallTestData.projectId,
    smallTestData.tasks,
    smallTestData.resources,
    { fixedAssignments: [] }
  ));
  
  results.push(await runPerformanceTest(
    'autoDistributeTasks_medium',
    loadOptimizationService.autoDistributeTasks.bind(loadOptimizationService),
    mediumTestData.projectId,
    mediumTestData.tasks,
    mediumTestData.resources,
    { fixedAssignments: [] }
  ));
  
  // 5. 미래 부하 예측 성능 테스트
  const newTasks = [
    {
      id: 'new-task-1',
      name: '새 작업 1',
      startDate: '2025-01-15',
      endDate: '2025-01-20',
      effort: 30,
      resourceId: smallTestData.resources[0].id
    },
    {
      id: 'new-task-2',
      name: '새 작업 2',
      startDate: '2025-01-18',
      endDate: '2025-01-25',
      effort: 40,
      resourceId: smallTestData.resources[1].id
    }
  ];
  
  results.push(await runPerformanceTest(
    'predictFutureLoad_small',
    loadOptimizationService.predictFutureLoad.bind(loadOptimizationService),
    smallTestData.projectId,
    smallTestData.teamId,
    smallTestData.startDate,
    smallTestData.endDate,
    newTasks
  ));
  
  // 성능 테스트 요약 생성
  const summary = {
    timestamp: new Date().toISOString(),
    tests: results.map(result => ({
      testName: result.testName,
      mean: result.mean,
      median: result.median
    }))
  };
  
  // 요약 저장
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const summaryFile = path.join(RESULTS_DIR, `performance-summary-${timestamp}.json`);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  console.log(`\nPerformance test summary saved to: ${summaryFile}`);
  console.log('All performance tests completed');
  
  return summary;
}

// 성능 테스트 실행 (직접 실행 시)
if (require.main === module) {
  // gc 플래그가 활성화되어 있는지 확인
  if (!global.gc) {
    console.warn('For more accurate results, run with --expose-gc flag: node --expose-gc performanceTests.js');
  }
  
  runAllPerformanceTests().catch(error => {
    console.error('Performance test failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runPerformanceTest,
  runAllPerformanceTests,
  generateTestData
};
