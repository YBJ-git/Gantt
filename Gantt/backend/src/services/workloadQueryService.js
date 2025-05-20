const queryOptimizer = require('../utils/queryOptimizer');
const logger = require('../utils/logger');
const cache = require('../utils/cache');
const { sqlPool } = require('../config/database');

class WorkloadQueryService {
  /**
   * 작업 부하 데이터를 최적화된 방식으로 조회합니다
   * @param {number} projectId - 프로젝트 ID
   * @param {Object} filters - 필터링 조건
   */
  async getWorkloadData(projectId, filters = {}) {
    try {
      const cacheKey = `workload:${projectId}:${JSON.stringify(filters)}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        logger.info(`Cache hit for workload data: ${cacheKey}`);
        return cachedData;
      }
      
      // 필터 조건 구성
      const whereConditions = ['project_id = @param0'];
      const params = [projectId];
      let paramIndex = 1;
      
      if (filters.startDate) {
        whereConditions.push('start_date >= @param' + paramIndex);
        params.push(filters.startDate);
        paramIndex++;
      }
      
      if (filters.endDate) {
        whereConditions.push('end_date <= @param' + paramIndex);
        params.push(filters.endDate);
        paramIndex++;
      }
      
      if (filters.resourceIds && filters.resourceIds.length) {
        whereConditions.push(`resource_id IN (${filters.resourceIds.map(() => '@param' + paramIndex++).join(', ')})`);
        params.push(...filters.resourceIds);
      }
      
      const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // 최적화된 쿼리 실행
      const query = `
        SELECT 
          t.task_id,
          t.task_name,
          t.start_date,
          t.end_date,
          t.duration,
          t.completed_percentage,
          t.resource_id,
          r.resource_name,
          r.resource_capacity,
          w.workload_value,
          w.workload_date
        FROM 
          tasks t
        LEFT JOIN 
          resources r ON t.resource_id = r.resource_id
        LEFT JOIN 
          workloads w ON t.task_id = w.task_id
        ${whereClause}
        ORDER BY 
          t.start_date, t.task_id
      `;
      
      const result = await queryOptimizer.cachedQuery(
        `getWorkloadData:${projectId}`,
        query,
        params,
        300000 // 5분 캐시
      );
      
      // 데이터 후처리 및 재구성
      const workloadData = this._processWorkloadData(result.recordset);
      
      // 캐시에 결과 저장
      await cache.set(cacheKey, workloadData, 300); // 5분 캐시
      
      return workloadData;
    } catch (error) {
      logger.error(`Error in getWorkloadData: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 대량의 작업 데이터를 페이지 단위로 조회합니다
   * @param {number} projectId - 프로젝트 ID
   * @param {number} page - 페이지 번호
   * @param {number} pageSize - 페이지 크기
   */
  async getWorkloadDataPaginated(projectId, page = 1, pageSize = 50) {
    try {
      const baseQuery = `
        SELECT 
          t.task_id,
          t.task_name,
          t.start_date,
          t.end_date,
          t.duration,
          t.completed_percentage,
          t.resource_id,
          r.resource_name,
          r.resource_capacity
        FROM 
          tasks t
        LEFT JOIN 
          resources r ON t.resource_id = r.resource_id
        WHERE 
          t.project_id = @param0
        ORDER BY 
          t.start_date, t.task_id
      `;
      
      const result = await queryOptimizer.paginatedQuery(
        baseQuery,
        page,
        pageSize,
        [projectId]
      );
      
      // 총 레코드 수 조회
      const countResult = await queryOptimizer.cachedQuery(
        `getWorkloadCount:${projectId}`,
        `SELECT COUNT(*) as total FROM tasks WHERE project_id = @param0`,
        [projectId],
        600000 // 10분 캐시
      );
      
      return {
        data: result.recordset,
        pagination: {
          page,
          pageSize,
          totalRecords: countResult.recordset[0].total,
          totalPages: Math.ceil(countResult.recordset[0].total / pageSize)
        }
      };
    } catch (error) {
      logger.error(`Error in getWorkloadDataPaginated: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 리소스별 전체 부하 요약 정보를 조회합니다
   * @param {number} projectId - 프로젝트 ID
   */
  async getResourceWorkloadSummary(projectId) {
    try {
      const cacheKey = `resourceWorkloadSummary:${projectId}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      // 저장 프로시저 호출을 통한 최적화된 조회
      const query = `EXEC GetResourceWorkloadSummary @ProjectId = @param0`;
      
      const result = await queryOptimizer.measureQueryPerformance(
        `getResourceWorkloadSummary:${projectId}`,
        async () => {
          const pool = await sqlPool;
          const request = pool.request();
          request.input('param0', projectId);
          return request.query(query);
        },
        []
      );
      
      await cache.set(cacheKey, result.recordset, 600); // 10분 캐시
      
      return result.recordset;
    } catch (error) {
      logger.error(`Error in getResourceWorkloadSummary: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 작업 부하 데이터 후처리
   * @param {Array} recordset - 쿼리 결과
   * @private
   */
  _processWorkloadData(recordset) {
    const taskMap = new Map();
    
    // 작업별 데이터 그룹화
    recordset.forEach(record => {
      if (!taskMap.has(record.task_id)) {
        taskMap.set(record.task_id, {
          taskId: record.task_id,
          taskName: record.task_name,
          startDate: record.start_date,
          endDate: record.end_date,
          duration: record.duration,
          completedPercentage: record.completed_percentage,
          resourceId: record.resource_id,
          resourceName: record.resource_name,
          resourceCapacity: record.resource_capacity,
          workloadByDate: []
        });
      }
      
      // 일별 부하 데이터 추가
      if (record.workload_date && record.workload_value) {
        const task = taskMap.get(record.task_id);
        task.workloadByDate.push({
          date: record.workload_date,
          value: record.workload_value
        });
      }
    });
    
    return Array.from(taskMap.values());
  }
}

module.exports = new WorkloadQueryService();