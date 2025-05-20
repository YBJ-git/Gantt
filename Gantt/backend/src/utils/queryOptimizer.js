const logger = require('./logger');
const { sqlPool } = require('../config/database');

class QueryOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.queryStats = new Map();
  }

  /**
   * 쿼리 실행 시간을 측정하고 통계를 저장합니다
   * @param {string} queryId - 쿼리 식별자
   * @param {function} queryFunction - 실행할 쿼리 함수
   * @param {Array} params - 쿼리 파라미터
   */
  async measureQueryPerformance(queryId, queryFunction, params = []) {
    const start = performance.now();
    try {
      const result = await queryFunction(...params);
      const duration = performance.now() - start;
      
      if (!this.queryStats.has(queryId)) {
        this.queryStats.set(queryId, {
          count: 0,
          totalDuration: 0,
          avgDuration: 0,
          minDuration: Infinity,
          maxDuration: 0
        });
      }
      
      const stats = this.queryStats.get(queryId);
      stats.count += 1;
      stats.totalDuration += duration;
      stats.avgDuration = stats.totalDuration / stats.count;
      stats.minDuration = Math.min(stats.minDuration, duration);
      stats.maxDuration = Math.max(stats.maxDuration, duration);
      
      if (duration > 500) {
        logger.warn(`Slow query detected - ${queryId}: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      logger.error(`Query error in ${queryId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * 자주 사용되는 쿼리 결과를 캐싱합니다
   * @param {string} queryId - 쿼리 식별자
   * @param {string} queryText - SQL 쿼리 텍스트
   * @param {Array} params - 쿼리 파라미터
   * @param {number} ttl - 캐시 유효 시간(ms)
   */
  async cachedQuery(queryId, queryText, params = [], ttl = 60000) {
    const cacheKey = `${queryId}:${JSON.stringify(params)}`;
    
    const cachedResult = this.queryCache.get(cacheKey);
    if (cachedResult && cachedResult.expiry > Date.now()) {
      return cachedResult.data;
    }
    
    const result = await this.measureQueryPerformance(
      queryId,
      async () => {
        const pool = await sqlPool;
        const request = pool.request();
        
        if (Array.isArray(params) && params.length) {
          params.forEach((param, index) => {
            request.input(`param${index}`, param);
          });
        }
        
        return request.query(queryText);
      },
      []
    );
    
    this.queryCache.set(cacheKey, {
      data: result,
      expiry: Date.now() + ttl
    });
    
    return result;
  }
  
  /**
   * 대용량 데이터 쿼리를 위한 페이지네이션 지원 함수
   * @param {string} baseQuery - 기본 쿼리 텍스트
   * @param {number} page - 페이지 번호
   * @param {number} pageSize - 페이지 크기
   * @param {Array} params - 쿼리 파라미터
   */
  async paginatedQuery(baseQuery, page = 1, pageSize = 100, params = []) {
    const offset = (page - 1) * pageSize;
    const paginatedQuery = `${baseQuery} OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
    
    return this.measureQueryPerformance(
      `paginated:${baseQuery.substring(0, 30)}`,
      async () => {
        const pool = await sqlPool;
        const request = pool.request();
        
        if (Array.isArray(params) && params.length) {
          params.forEach((param, index) => {
            request.input(`param${index}`, param);
          });
        }
        
        return request.query(paginatedQuery);
      },
      []
    );
  }

  /**
   * 쿼리 성능 통계 리포트 생성
   */
  getQueryPerformanceReport() {
    const report = [];
    this.queryStats.forEach((stats, queryId) => {
      report.push({
        queryId,
        executionCount: stats.count,
        avgDuration: stats.avgDuration.toFixed(2),
        minDuration: stats.minDuration.toFixed(2),
        maxDuration: stats.maxDuration.toFixed(2),
        isSlowQuery: stats.avgDuration > 300
      });
    });
    
    return report;
  }
  
  /**
   * 모든 캐시 항목 무효화
   */
  invalidateCache() {
    this.queryCache.clear();
    logger.info('Query cache invalidated');
  }
}

module.exports = new QueryOptimizer();