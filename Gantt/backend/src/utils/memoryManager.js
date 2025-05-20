const logger = require('./logger');
const v8 = require('v8');
const os = require('os');

class MemoryManager {
  constructor() {
    this.heapWarningThreshold = 0.85; // 힙 메모리 경고 임계값 (85%)
    this.memoryUsageLogInterval = 300000; // 5분마다 메모리 사용량 로깅
    this.lastLogTime = 0;
    this.gcCallCount = 0;
  }

  /**
   * 현재 메모리 사용량 상태 조회
   */
  getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();
    const systemMemory = os.totalmem();
    const freeMemory = os.freemem();
    
    const heapUsedPercentage = (memoryUsage.heapUsed / heapStats.heap_size_limit) * 100;
    const systemMemoryUsedPercentage = ((systemMemory - freeMemory) / systemMemory) * 100;
    
    return {
      heapUsed: this._formatBytes(memoryUsage.heapUsed),
      heapTotal: this._formatBytes(memoryUsage.heapTotal),
      external: this._formatBytes(memoryUsage.external),
      rss: this._formatBytes(memoryUsage.rss),
      heapSizeLimit: this._formatBytes(heapStats.heap_size_limit),
      heapUsedPercentage: heapUsedPercentage.toFixed(2) + '%',
      systemMemoryUsedPercentage: systemMemoryUsedPercentage.toFixed(2) + '%',
      systemTotalMemory: this._formatBytes(systemMemory),
      systemFreeMemory: this._formatBytes(freeMemory)
    };
  }

  /**
   * 주기적으로 메모리 사용량 로깅
   */
  logMemoryUsage() {
    const now = Date.now();
    
    // 마지막 로깅 이후 일정 시간 경과한 경우만 로깅
    if (now - this.lastLogTime >= this.memoryUsageLogInterval) {
      const memoryUsage = this.getMemoryUsage();
      logger.info(`Memory usage: Heap: ${memoryUsage.heapUsed}/${memoryUsage.heapTotal} (${memoryUsage.heapUsedPercentage}), System: ${memoryUsage.systemFreeMemory} free of ${memoryUsage.systemTotalMemory}`);
      this.lastLogTime = now;
    }
  }

  /**
   * 메모리 사용량 모니터링 및 경고
   */
  monitorMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();
    
    const heapUsedPercentage = memoryUsage.heapUsed / heapStats.heap_size_limit;
    
    // 힙 메모리 사용량이 임계값을 초과하면 경고
    if (heapUsedPercentage > this.heapWarningThreshold) {
      logger.warn(`High memory usage detected: ${(heapUsedPercentage * 100).toFixed(2)}% of heap limit`);
      
      // 메모리 부족 상황에서 GC 실행 제안
      if (global.gc) {
        this.gcCallCount++;
        logger.info(`Suggesting garbage collection (call #${this.gcCallCount})`);
        global.gc();
      }
    }
    
    return heapUsedPercentage;
  }

  /**
   * 큰 데이터 처리를 위한 스트림 프로세싱 함수
   * @param {function} dataSourceFn - 데이터 소스 함수
   * @param {function} processFn - 각 항목 처리 함수
   * @param {number} batchSize - 배치 크기
   */
  async streamProcess(dataSourceFn, processFn, batchSize = 100) {
    let offset = 0;
    let hasMore = true;
    let processedCount = 0;
    
    while (hasMore) {
      // 메모리 사용량 모니터링
      this.monitorMemoryUsage();
      
      // 데이터 배치 가져오기
      const batch = await dataSourceFn(offset, batchSize);
      
      if (batch.length === 0) {
        hasMore = false;
        break;
      }
      
      // 배치 데이터 처리
      for (const item of batch) {
        await processFn(item);
        processedCount++;
      }
      
      // 다음 배치로 이동
      offset += batch.length;
      
      // 작은 지연을 두어 이벤트 루프 차단 방지
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return processedCount;
  }

  /**
   * 대용량 작업을 여러 워커로 분산하기 위한 작업 분할
   * @param {Array} items - 처리할 항목 배열
   * @param {number} workerCount - 워커 수
   */
  partitionWorkForWorkers(items, workerCount = os.cpus().length) {
    const partitions = Array(workerCount).fill().map(() => []);
    
    items.forEach((item, index) => {
      const partitionIndex = index % workerCount;
      partitions[partitionIndex].push(item);
    });
    
    return partitions;
  }

  /**
   * 바이트를 사람이 읽기 쉬운 형식으로 변환
   * @param {number} bytes - 바이트 수
   * @private
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new MemoryManager();