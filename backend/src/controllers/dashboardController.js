/**
 * Dashboard Controller
 * 대시보드 데이터 관련 컨트롤러
 */
const db = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * 대시보드 메인 데이터 조회
 */
const getDashboardData = async (req, res) => {
    try {
        // 1. 전체 리소스 수
        const resourcesResult = await db.all('SELECT COUNT(*) as count FROM resources');
        const resourcesCount = resourcesResult && resourcesResult.length > 0 ? resourcesResult[0].count : 0;

        // 2. 활성 작업 수  
        const tasksResult = await db.all("SELECT COUNT(*) as count FROM tasks WHERE status IN ('in-progress', 'planned')");
        const tasksCount = tasksResult && tasksResult.length > 0 ? tasksResult[0].count : 0;

        // 3. 전체 리소스 평균 부하율 계산
        const avgUtilizationResult = await db.all('SELECT AVG(utilization) as avg_utilization FROM resources');
        const overallLoad = Math.round(avgUtilizationResult && avgUtilizationResult.length > 0 ? (avgUtilizationResult[0].avg_utilization || 0) : 0);

        // 4. 부하 임계치 초과 리소스 수 (100% 이상)
        const criticalResult = await db.all('SELECT COUNT(*) as count FROM resources WHERE utilization > 100');
        const criticalTasks = criticalResult && criticalResult.length > 0 ? criticalResult[0].count : 0;

        // 5. 기한 초과 작업 수
        const overdueResult = await db.all("SELECT COUNT(*) as count FROM tasks WHERE end_date < CURRENT_DATE AND status != 'completed'");
        const overdueTasksCount = overdueResult && overdueResult.length > 0 ? overdueResult[0].count : 0;

        // 6. 7일 내 마감 작업 수
        const upcomingResult = await db.all(`
            SELECT COUNT(*) as count FROM tasks 
            WHERE end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
            AND status != 'completed'
        `);
        const upcomingDeadlinesCount = upcomingResult && upcomingResult.length > 0 ? upcomingResult[0].count : 0;

        // 7. 부하가 높은 리소스 TOP 3
        const mostLoadedResult = await db.all(`
            SELECT r.id, r.name, r.utilization, r.capacity 
            FROM resources r 
            ORDER BY r.utilization DESC 
            LIMIT 3
        `);

        // 8. 부하가 낮은 리소스 TOP 3
        const leastLoadedResult = await db.all(`
            SELECT r.id, r.name, r.utilization, r.capacity 
            FROM resources r 
            ORDER BY r.utilization ASC 
            LIMIT 3
        `);

        // 9. 다가오는 마감일 작업들
        const upcomingDeadlinesResult = await db.all(`
            SELECT t.id, t.name, r.name as resourceName, t.end_date as deadline
            FROM tasks t
            LEFT JOIN resource_assignments ra ON t.id = ra.task_id
            LEFT JOIN resources r ON ra.resource_id = r.id
            WHERE t.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
            AND t.status != 'completed'
            ORDER BY t.end_date ASC
            LIMIT 5
        `);

        // 10. 최근 최적화 이력 (임시 더미 데이터)
        const recentOptimizations = [
            { 
                id: 1, 
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), 
                description: '개발자 C의 작업 부하 재분배' 
            },
            { 
                id: 2, 
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
                description: 'QA 엔지니어 일정 최적화' 
            }
        ];

        // 11. 간트 차트용 데이터
        const ganttResourcesResult = await db.all(`
            SELECT r.id, r.name, dt.name as title, r.utilization as load,
                   COUNT(ra.task_id) as tasks
            FROM resources r
            LEFT JOIN departments dt ON r.department_id = dt.id
            LEFT JOIN resource_assignments ra ON r.id = ra.resource_id
            GROUP BY r.id, r.name, dt.name, r.utilization
            LIMIT 4
        `);

        const ganttTasksResult = await db.all(`
            SELECT t.id, t.name as text, ra.resource_id as resourceId,
                   t.start_date, t.end_date, t.progress,
                   STRING_AGG(td.predecessor_id::text, ',') as dependencies
            FROM tasks t
            LEFT JOIN resource_assignments ra ON t.id = ra.task_id
            LEFT JOIN task_dependencies td ON t.id = td.successor_id
            WHERE t.status != 'completed'
            GROUP BY t.id, t.name, ra.resource_id, t.start_date, t.end_date, t.progress
            ORDER BY t.start_date
        `);

        // dependencies를 배열로 변환
        const ganttTasks = ganttTasksResult ? ganttTasksResult.map(task => ({
            ...task,
            dependencies: task.dependencies ? task.dependencies.split(',').map(dep => parseInt(dep)) : []
        })) : [];

        const dashboardData = {
            overallLoad,
            resourcesCount,
            tasksCount,
            criticalTasks,
            overdueTasksCount,
            upcomingDeadlinesCount,
            mostLoadedResources: mostLoadedResult || [],
            leastLoadedResources: leastLoadedResult || [],
            recentOptimizations,
            upcomingDeadlines: upcomingDeadlinesResult || [],
            ganttChartData: {
                resources: ganttResourcesResult || [],
                tasks: ganttTasks
            }
        };

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        logger.error('대시보드 데이터 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '대시보드 데이터를 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 히트맵 데이터 조회
 */
const getHeatmapData = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // PostgreSQL 호환 쿼리로 수정
        const query = `
            SELECT 
                wd.date,
                r.name as resourceName,
                wd.utilization_percentage as utilization
            FROM workload_data wd
            JOIN resources r ON wd.resource_id = r.id
            WHERE wd.date BETWEEN $1 AND $2
            ORDER BY wd.date, r.name
        `;

        const heatmapResult = await db.all(query, [
            startDate || '2025-05-01',
            endDate || '2025-05-31'
        ]);

        res.status(200).json({
            success: true,
            data: heatmapResult || []
        });

    } catch (error) {
        logger.error('히트맵 데이터 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '히트맵 데이터를 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardData,
    getHeatmapData
};