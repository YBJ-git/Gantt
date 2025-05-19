/**
 * Load Optimization Repository
 * 부하 최적화 관련 데이터베이스 작업
 */
const db = require('../config/database');
const logger = require('../utils/logger');

// 최적화 추천사항 저장
exports.saveOptimizationRecommendations = async (projectId, recommendations, startDate, endDate, threshold) => {
  try {
    // 트랜잭션 시작
    const transaction = await db.beginTransaction();
    
    try {
      // 1. 최적화 헤더 정보 저장
      const optHeaderQuery = `
        INSERT INTO load_optimization_header (
          project_id, 
          start_date, 
          end_date, 
          threshold, 
          created_at, 
          created_by, 
          status
        ) 
        VALUES (?, ?, ?, ?, GETDATE(), SYSTEM_USER, 'PENDING')
      `;
      
      const [optHeaderResult] = await transaction.execute(optHeaderQuery, [
        projectId,
        startDate,
        endDate,
        threshold
      ]);
      
      const optimizationId = optHeaderResult.insertId;
      
      // 2. 추천 사항 상세 저장
      if (recommendations && recommendations.length > 0) {
        const optDetailValues = recommendations.map((rec, index) => [
          optimizationId,
          rec.taskId,
          rec.currentResourceId,
          rec.suggestedResourceId,
          rec.overloadDate,
          rec.expectedLoadReduction,
          rec.reason,
          index + 1, // 순서
          'PENDING'  // 상태
        ]);
        
        const optDetailPlaceholders = optDetailValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        
        const optDetailQuery = `
          INSERT INTO load_optimization_detail (
            optimization_id,
            task_id,
            current_resource_id,
            suggested_resource_id,
            overload_date,
            expected_load_reduction,
            reason,
            sequence,
            status
          )
          VALUES ${optDetailPlaceholders}
        `;
        
        await transaction.execute(optDetailQuery, optDetailValues.flat());
      }
      
      // 트랜잭션 커밋
      await transaction.commit();
      
      return optimizationId;
    } catch (error) {
      // 오류 발생 시 롤백
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(`최적화 추천사항 저장 실패: ${error.message}`);
    throw error;
  }
};

// 재분배 계획 저장
exports.saveRedistributionPlan = async (projectId, redistributionPlan, resultAnalysis) => {
  try {
    // 트랜잭션 시작
    const transaction = await db.beginTransaction();
    
    try {
      // 1. 재분배 헤더 정보 저장
      const redistHeaderQuery = `
        INSERT INTO task_redistribution_header (
          project_id,
          created_at,
          created_by,
          balance_score,
          status
        )
        VALUES (?, GETDATE(), SYSTEM_USER, ?, 'PENDING')
      `;
      
      const [redistHeaderResult] = await transaction.execute(redistHeaderQuery, [
        projectId,
        resultAnalysis.balanceScore
      ]);
      
      const redistributionId = redistHeaderResult.insertId;
      
      // 2. 재분배 상세 저장
      if (redistributionPlan && redistributionPlan.length > 0) {
        const redistDetailValues = redistributionPlan.map(item => [
          redistributionId,
          item.taskId,
          item.resourceId,
          item.isFixed ? 'FIXED' : 'SUGGESTED',
          'PENDING'
        ]);
        
        const redistDetailPlaceholders = redistDetailValues.map(() => '(?, ?, ?, ?, ?)').join(', ');
        
        const redistDetailQuery = `
          INSERT INTO task_redistribution_detail (
            redistribution_id,
            task_id,
            resource_id,
            assignment_type,
            status
          )
          VALUES ${redistDetailPlaceholders}
        `;
        
        await transaction.execute(redistDetailQuery, redistDetailValues.flat());
      }
      
      // 3. 분석 결과 저장
      if (resultAnalysis && resultAnalysis.resourceStats) {
        const statsValues = resultAnalysis.resourceStats.map(stat => [
          redistributionId,
          stat.resourceId,
          stat.taskCount,
          stat.taskCountChange,
          stat.isBalanced ? 'BALANCED' : 'UNBALANCED'
        ]);
        
        const statsPlaceholders = statsValues.map(() => '(?, ?, ?, ?, ?)').join(', ');
        
        const statsQuery = `
          INSERT INTO redistribution_resource_stats (
            redistribution_id,
            resource_id,
            task_count,
            task_count_change,
            balance_status
          )
          VALUES ${statsPlaceholders}
        `;
        
        await transaction.execute(statsQuery, statsValues.flat());
      }
      
      // 트랜잭션 커밋
      await transaction.commit();
      
      return redistributionId;
    } catch (error) {
      // 오류 발생 시 롤백
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(`재분배 계획 저장 실패: ${error.message}`);
    throw error;
  }
};

// 최적화 ID로 조회
exports.getOptimizationById = async (optimizationId) => {
  try {
    const query = `
      SELECT 
        h.id,
        h.project_id AS projectId,
        h.start_date AS startDate,
        h.end_date AS endDate,
        h.threshold,
        h.created_at AS createdAt,
        h.created_by AS createdBy,
        h.status
      FROM 
        load_optimization_header h
      WHERE 
        h.id = ?
    `;
    
    const [rows] = await db.execute(query, [optimizationId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const optimization = rows[0];
    
    // 상세 추천 사항 조회
    const detailQuery = `
      SELECT 
        d.id,
        d.task_id AS taskId,
        d.current_resource_id AS currentResourceId,
        d.suggested_resource_id AS suggestedResourceId,
        d.overload_date AS overloadDate,
        d.expected_load_reduction AS expectedLoadReduction,
        d.reason,
        d.sequence,
        d.status
      FROM 
        load_optimization_detail d
      WHERE 
        d.optimization_id = ?
      ORDER BY 
        d.sequence
    `;
    
    const [detailRows] = await db.execute(detailQuery, [optimizationId]);
    
    optimization.recommendations = detailRows;
    
    return optimization;
  } catch (error) {
    logger.error(`최적화 ID로 조회 실패: ${error.message}`);
    throw error;
  }
};

// 적용된 최적화 저장
exports.saveAppliedOptimization = async (optimizationId, modifications, updateResults) => {
  try {
    // 트랜잭션 시작
    const transaction = await db.beginTransaction();
    
    try {
      // 1. 헤더 상태 업데이트
      const updateHeaderQuery = `
        UPDATE load_optimization_header
        SET status = 'APPLIED', applied_at = GETDATE(), applied_by = SYSTEM_USER
        WHERE id = ?
      `;
      
      await transaction.execute(updateHeaderQuery, [optimizationId]);
      
      // 2. 적용 이력 저장
      const appliedQuery = `
        INSERT INTO load_optimization_applied (
          optimization_id,
          applied_at,
          applied_by,
          modifications_count
        )
        VALUES (?, GETDATE(), SYSTEM_USER, ?)
      `;
      
      const [appliedResult] = await transaction.execute(appliedQuery, [
        optimizationId,
        modifications.length
      ]);
      
      const appliedId = appliedResult.insertId;
      
      // 3. 적용 상세 저장
      if (modifications && modifications.length > 0) {
        const appliedDetailValues = modifications.map((mod, index) => [
          appliedId,
          mod.taskId,
          mod.oldResourceId,
          mod.newResourceId,
          updateResults[index].success ? 'SUCCESS' : 'FAILED',
          updateResults[index].message || null
        ]);
        
        const appliedDetailPlaceholders = appliedDetailValues.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        
        const appliedDetailQuery = `
          INSERT INTO load_optimization_applied_detail (
            applied_id,
            task_id,
            old_resource_id,
            new_resource_id,
            status,
            message
          )
          VALUES ${appliedDetailPlaceholders}
        `;
        
        await transaction.execute(appliedDetailQuery, appliedDetailValues.flat());
      }
      
      // 4. 상세 추천사항 상태 업데이트
      const updateDetailsQuery = `
        UPDATE load_optimization_detail
        SET status = 'APPLIED'
        WHERE optimization_id = ? AND 
              task_id IN (?) AND
              suggested_resource_id IN (?)
      `;
      
      const taskIds = modifications.map(mod => mod.taskId);
      const resourceIds = modifications.map(mod => mod.newResourceId);
      
      await transaction.execute(updateDetailsQuery, [optimizationId, taskIds, resourceIds]);
      
      // 트랜잭션 커밋
      await transaction.commit();
      
      return appliedId;
    } catch (error) {
      // 오류 발생 시 롤백
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(`적용된 최적화 저장 실패: ${error.message}`);
    throw error;
  }
};

// 부하 예측 저장
exports.savePrediction = async (projectId, teamId, startDate, endDate, newTasks, predictedLoadData) => {
  try {
    // 트랜잭션 시작
    const transaction = await db.beginTransaction();
    
    try {
      // 1. 예측 헤더 저장
      const predictionHeaderQuery = `
        INSERT INTO load_prediction_header (
          project_id,
          team_id,
          start_date,
          end_date,
          created_at,
          created_by,
          new_tasks_count,
          avg_load_before,
          avg_load_after,
          load_difference
        )
        VALUES (?, ?, ?, ?, GETDATE(), SYSTEM_USER, ?, ?, ?, ?)
      `;
      
      const [predictionHeaderResult] = await transaction.execute(predictionHeaderQuery, [
        projectId,
        teamId,
        startDate,
        endDate,
        newTasks.length,
        predictedLoadData.difference.systemAvgLoadBefore,
        predictedLoadData.difference.systemAvgLoadAfter,
        predictedLoadData.difference.systemLoadDiff
      ]);
      
      const predictionId = predictionHeaderResult.insertId;
      
      // 2. 예측 작업 저장
      if (newTasks && newTasks.length > 0) {
        const newTasksValues = newTasks.map(task => [
          predictionId,
          task.name,
          task.resourceId,
          task.startDate,
          task.endDate,
          task.effort || 0,
          task.description || null
        ]);
        
        const newTasksPlaceholders = newTasksValues.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
        
        const newTasksQuery = `
          INSERT INTO load_prediction_tasks (
            prediction_id,
            task_name,
            resource_id,
            start_date,
            end_date,
            effort,
            description
          )
          VALUES ${newTasksPlaceholders}
        `;
        
        await transaction.execute(newTasksQuery, newTasksValues.flat());
      }
      
      // 3. 리소스별 부하 차이 저장
      if (predictedLoadData.difference.resourceLoadDiffs && predictedLoadData.difference.resourceLoadDiffs.length > 0) {
        const diffValues = predictedLoadData.difference.resourceLoadDiffs.map(diff => [
          predictionId,
          diff.resourceId,
          diff.avgLoadDiff,
          diff.maxLoadDiff,
          diff.overloadedDaysBefore,
          diff.overloadedDaysAfter
        ]);
        
        const diffPlaceholders = diffValues.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        
        const diffQuery = `
          INSERT INTO load_prediction_resource_diff (
            prediction_id,
            resource_id,
            avg_load_diff,
            max_load_diff,
            overloaded_days_before,
            overloaded_days_after
          )
          VALUES ${diffPlaceholders}
        `;
        
        await transaction.execute(diffQuery, diffValues.flat());
      }
      
      // 트랜잭션 커밋
      await transaction.commit();
      
      return predictionId;
    } catch (error) {
      // 오류 발생 시 롤백
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(`부하 예측 저장 실패: ${error.message}`);
    throw error;
  }
};

// 예측 ID로 조회
exports.getPredictionById = async (predictionId) => {
  try {
    const query = `
      SELECT 
        h.id,
        h.project_id AS projectId,
        h.team_id AS teamId,
        h.start_date AS startDate,
        h.end_date AS endDate,
        h.created_at AS createdAt,
        h.created_by AS createdBy,
        h.new_tasks_count AS newTasksCount,
        h.avg_load_before AS avgLoadBefore,
        h.avg_load_after AS avgLoadAfter,
        h.load_difference AS loadDifference
      FROM 
        load_prediction_header h
      WHERE 
        h.id = ?
    `;
    
    const [rows] = await db.execute(query, [predictionId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const prediction = rows[0];
    
    // 예측 작업 조회
    const tasksQuery = `
      SELECT 
        t.id,
        t.task_name AS taskName,
        t.resource_id AS resourceId,
        t.start_date AS startDate,
        t.end_date AS endDate,
        t.effort,
        t.description
      FROM 
        load_prediction_tasks t
      WHERE 
        t.prediction_id = ?
    `;
    
    const [taskRows] = await db.execute(tasksQuery, [predictionId]);
    
    prediction.tasks = taskRows;
    
    // 리소스별 부하 차이 조회
    const diffQuery = `
      SELECT 
        d.resource_id AS resourceId,
        r.name AS resourceName,
        d.avg_load_diff AS avgLoadDiff,
        d.max_load_diff AS maxLoadDiff,
        d.overloaded_days_before AS overloadedDaysBefore,
        d.overloaded_days_after AS overloadedDaysAfter
      FROM 
        load_prediction_resource_diff d
      JOIN
        resources r ON d.resource_id = r.id
      WHERE 
        d.prediction_id = ?
    `;
    
    const [diffRows] = await db.execute(diffQuery, [predictionId]);
    
    prediction.resourceLoadDiffs = diffRows;
    
    return prediction;
  } catch (error) {
    logger.error(`예측 ID로 조회 실패: ${error.message}`);
    throw error;
  }
};

// 프로젝트별 최적화 히스토리 조회
exports.getOptimizationHistoryByProject = async (projectId, limit = 10) => {
  try {
    const query = `
      SELECT 
        h.id,
        h.project_id AS projectId,
        h.start_date AS startDate,
        h.end_date AS endDate,
        h.threshold,
        h.created_at AS createdAt,
        h.created_by AS createdBy,
        h.status,
        h.applied_at AS appliedAt,
        h.applied_by AS appliedBy,
        COUNT(d.id) AS recommendationsCount,
        SUM(CASE WHEN d.status = 'APPLIED' THEN 1 ELSE 0 END) AS appliedCount
      FROM 
        load_optimization_header h
      LEFT JOIN
        load_optimization_detail d ON h.id = d.optimization_id
      WHERE 
        h.project_id = ?
      GROUP BY
        h.id,
        h.project_id,
        h.start_date,
        h.end_date,
        h.threshold,
        h.created_at,
        h.created_by,
        h.status,
        h.applied_at,
        h.applied_by
      ORDER BY 
        h.created_at DESC
      LIMIT ?
    `;
    
    const [rows] = await db.execute(query, [projectId, limit]);
    
    return rows;
  } catch (error) {
    logger.error(`프로젝트별 최적화 히스토리 조회 실패: ${error.message}`);
    throw error;
  }
};

// 리소스별 부하 히스토리 조회
exports.getResourceLoadHistory = async (resourceId, startDate, endDate) => {
  try {
    const query = `
      SELECT 
        r.date,
        r.load,
        r.task_count AS taskCount
      FROM 
        resource_daily_load r
      WHERE 
        r.resource_id = ? AND
        r.date BETWEEN ? AND ?
      ORDER BY 
        r.date
    `;
    
    const [rows] = await db.execute(query, [resourceId, startDate, endDate]);
    
    return rows;
  } catch (error) {
    logger.error(`리소스별 부하 히스토리 조회 실패: ${error.message}`);
    throw error;
  }
};