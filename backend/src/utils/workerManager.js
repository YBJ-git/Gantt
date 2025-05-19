const { Worker } = require('worker_threads');
const os = require('os');
const path = require('path');
const logger = require('./logger');

class WorkerManager {
  constructor() {
    this.workerPool = new Map();
    this.maxWorkers = os.cpus().length;
    this.activeWorkers = 0;
    this.workerTaskQueue = [];
  }

  /**
   * 워커 풀 초기화
   * @param {number} poolSize - 워커 풀 크기 (기본값: CPU 코어 수)
   */
  initializeWorkerPool(poolSize = os.cpus().length) {
    this.maxWorkers = poolSize;
    logger.info(`Initializing worker pool with ${this.maxWorkers} workers`);
  }

  /**
   * 워커 스레드에서 작업 실행
   * @param {string} workerScriptPath - 워커 스크립트 경로
   * @param {Object} workerData - 워커에 전달할 데이터
   */
  runWorker(workerScriptPath, workerData) {
    return new Promise((resolve, reject) => {
      // 이미 최대 워커 수에 도달한 경우 큐에 작업 추가
      if (this.activeWorkers >= this.maxWorkers) {
        this.workerTaskQueue.push({ workerScriptPath, workerData, resolve, reject });
        logger.debug(`Worker capacity reached (${this.activeWorkers}/${this.maxWorkers}). Task queued. Queue size: ${this.workerTaskQueue.length}`);
        return;
      }
      
      this._createAndRunWorker(workerScriptPath, workerData, resolve, reject);
    });
  }

  /**
   * 워커 생성 및 실행 (내부 메서드)
   * @private
   */
  _createAndRunWorker(workerScriptPath, workerData, resolve, reject) {
    try {
      const absolutePath = path.resolve(workerScriptPath);
      
      const worker = new Worker(absolutePath, {
        workerData: workerData
      });
      
      const workerId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      this.workerPool.set(workerId, worker);
      this.activeWorkers++;
      
      logger.debug(`Worker ${workerId} started. Active workers: ${this.activeWorkers}/${this.maxWorkers}`);
      
      // 워커 메시지 처리
      worker.on('message', (result) => {
        resolve(result);
        this._cleanupWorker(workerId);
      });
      
      // 워커 에러 처리
      worker.on('error', (err) => {
        logger.error(`Worker ${workerId} error: ${err.message}`);
        reject(err);
        this._cleanupWorker(workerId);
      });
      
      // 워커 종료 처리
      worker.on('exit', (code) => {
        if (code !== 0) {
          const error = new Error(`Worker ${workerId} stopped with exit code ${code}`);
          logger.error(error.message);
          reject(error);
        }
        this._cleanupWorker(workerId);
      });
    } catch (err) {
      logger.error(`Failed to create worker: ${err.message}`);
      this.activeWorkers--; // 생성 실패한 경우 카운터 감소
      reject(err);
      
      // 큐에서 다음 작업 처리
      this._processNextQueuedTask();
    }
  }

  /**
   * 워커 정리 및 큐에서 다음 작업 처리
   * @param {string} workerId - 워커 ID
   * @private
   */
  _cleanupWorker(workerId) {
    if (this.workerPool.has(workerId)) {
      this.workerPool.delete(workerId);
      this.activeWorkers--;
      logger.debug(`Worker ${workerId} cleaned up. Active workers: ${this.activeWorkers}/${this.maxWorkers}`);
      
      // 큐에서 다음 작업 처리
      this._processNextQueuedTask();
    }
  }

  /**
   * 큐에서 다음 작업 처리
   * @private
   */
  _processNextQueuedTask() {
    if (this.workerTaskQueue.length > 0 && this.activeWorkers < this.maxWorkers) {
      const nextTask = this.workerTaskQueue.shift();
      logger.debug(`Processing next queued task. Remaining in queue: ${this.workerTaskQueue.length}`);
      this._createAndRunWorker(
        nextTask.workerScriptPath,
        nextTask.workerData,
        nextTask.resolve,
        nextTask.reject
      );
    }
  }

  /**
   * 모든 워커 종료
   */
  terminateAllWorkers() {
    logger.info(`Terminating all workers (${this.workerPool.size} active)`);
    
    for (const [workerId, worker] of this.workerPool.entries()) {
      try {
        worker.terminate();
        logger.debug(`Worker ${workerId} terminated`);
      } catch (err) {
        logger.error(`Error terminating worker ${workerId}: ${err.message}`);
      }
    }
    
    this.workerPool.clear();
    this.activeWorkers = 0;
    this.workerTaskQueue = [];
  }

  /**
   * 현재 워커 풀 상태 조회
   */
  getWorkerPoolStatus() {
    return {
      activeWorkers: this.activeWorkers,
      maxWorkers: this.maxWorkers,
      queuedTasks: this.workerTaskQueue.length,
      utilizationPercentage: (this.activeWorkers / this.maxWorkers) * 100
    };
  }
}

module.exports = new WorkerManager();