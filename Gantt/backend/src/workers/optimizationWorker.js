const { parentPort, workerData } = require('worker_threads');
const optimizationAlgorithm = require('../utils/optimizationAlgorithm');

// 워커 스레드에서 최적화 작업 수행
async function runOptimization() {
  try {
    // 데이터 추출
    const { projectId, tasks, resources, optimizationParams } = workerData;
    
    // 알고리즘 실행
    console.log(`[Worker] Starting optimization for project ${projectId} with ${tasks.length} tasks and ${resources.length} resources`);
    console.time('optimization');
    
    const optimizationResult = await optimizationAlgorithm.optimize(
      tasks,
      resources,
      optimizationParams
    );
    
    console.timeEnd('optimization');
    console.log(`[Worker] Optimization completed with ${optimizationResult.modifiedTasks.length} modified tasks`);
    
    // 결과 반환
    parentPort.postMessage({
      success: true,
      result: optimizationResult
    });
  } catch (error) {
    console.error(`[Worker] Optimization error: ${error.message}`);
    parentPort.postMessage({
      success: false,
      error: error.message
    });
  }
}

// 최적화 작업 실행
runOptimization();