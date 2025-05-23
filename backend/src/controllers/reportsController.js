/**
 * Reports Analysis Controller
 * 보고서 및 분석 관련 컨트롤러 (PostgreSQL 버전)
 */
const db = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * 리소스 활용도 분석 데이터
 */
const getResourceUtilizationData = async (req, res) => {
    try {
        const { startDate, endDate, department, resourceType } = req.query;

        let query = `
            SELECT 
                r.id,
                r.name,
                r.utilization,
                r.capacity,
                d.name as departmentName,
                rt.name as typeName,
                AVG(wd.utilization_percentage) as avgUtilization,
                MAX(wd.utilization_percentage) as maxUtilization,
                MIN(wd.utilization_percentage) as minUtilization
            FROM resources r
            LEFT JOIN departments d ON r.department_id = d.id
            LEFT JOIN resource_types rt ON r.type_id = rt.id
            LEFT JOIN workload_data wd ON r.id = wd.resource_id
        `;

        const conditions = [];
        const params = [];
        let paramCount = 0;

        if (startDate && endDate) {
            conditions.push(`wd.date BETWEEN $${++paramCount} AND $${++paramCount}`);
            params.push(startDate, endDate);
        }

        if (department) {
            conditions.push(`r.department_id = $${++paramCount}`);
            params.push(department);
        }

        if (resourceType) {
            conditions.push(`r.type_id = $${++paramCount}`);
            params.push(resourceType);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY r.id, r.name, r.utilization, r.capacity, d.name, rt.name ORDER BY avgUtilization DESC';

        const result = await db.all(query, params);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error('리소스 활용도 분석 데이터 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '리소스 활용도 분석 데이터를 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 작업 부하 추세 분석 데이터
 */
const getLoadTrendsData = async (req, res) => {
    try {
        const { startDate, endDate, department, resourceType } = req.query;

        let query = `
            SELECT 
                wd.date,
                AVG(wd.utilization_percentage) as avgUtilization,
                COUNT(DISTINCT wd.resource_id) as resourceCount,
                SUM(wd.workload_hours) as totalWorkloadHours,
                AVG(wd.workload_hours) as avgWorkloadHours
            FROM workload_data wd
            JOIN resources r ON wd.resource_id = r.id
        `;

        const conditions = [];
        const params = [];
        let paramCount = 0;

        if (startDate && endDate) {
            conditions.push(`wd.date BETWEEN $${++paramCount} AND $${++paramCount}`);
            params.push(startDate, endDate);
        }

        if (department) {
            conditions.push(`r.department_id = $${++paramCount}`);
            params.push(department);
        }

        if (resourceType) {
            conditions.push(`r.type_id = $${++paramCount}`);
            params.push(resourceType);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY wd.date ORDER BY wd.date';

        const result = await db.all(query, params);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error('작업 부하 추세 분석 데이터 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '작업 부하 추세 분석 데이터를 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 작업 완료율 분석 데이터
 */
const getTaskCompletionData = async (req, res) => {
    try {
        const { startDate, endDate, department, resourceType } = req.query;

        let query = `
            SELECT 
                p.name as projectName,
                COUNT(t.id) as totalTasks,
                SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
                SUM(CASE WHEN t.status = 'in-progress' THEN 1 ELSE 0 END) as inProgressTasks,
                SUM(CASE WHEN t.status = 'planned' THEN 1 ELSE 0 END) as plannedTasks,
                SUM(CASE WHEN t.status = 'delayed' THEN 1 ELSE 0 END) as delayedTasks,
                AVG(t.progress) as avgProgress,
                AVG(CASE WHEN t.actual_hours > 0 AND t.estimated_hours > 0 
                    THEN (t.actual_hours / t.estimated_hours) * 100 
                    ELSE NULL END) as efficiencyPercentage
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            LEFT JOIN resource_assignments ra ON t.id = ra.task_id
            LEFT JOIN resources r ON ra.resource_id = r.id
        `;

        const conditions = [];
        const params = [];
        let paramCount = 0;

        if (startDate && endDate) {
            conditions.push(`t.start_date BETWEEN $${++paramCount} AND $${++paramCount}`);
            params.push(startDate, endDate);
        }

        if (department) {
            conditions.push(`r.department_id = $${++paramCount}`);
            params.push(department);
        }

        if (resourceType) {
            conditions.push(`r.type_id = $${++paramCount}`);
            params.push(resourceType);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY p.id, p.name ORDER BY completedTasks DESC';

        const result = await db.all(query, params);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error('작업 완료율 분석 데이터 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '작업 완료율 분석 데이터를 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 비용 분석 데이터
 */
const getCostAnalysisData = async (req, res) => {
    try {
        const { startDate, endDate, department, resourceType } = req.query;

        let query = `
            SELECT 
                p.name as projectName,
                d.name as departmentName,
                rt.name as resourceTypeName,
                SUM(ra.actual_hours * r.cost_rate) as actualCost,
                SUM(ra.assigned_hours * r.cost_rate) as plannedCost,
                SUM(ra.actual_hours) as actualHours,
                SUM(ra.assigned_hours) as plannedHours,
                AVG(r.cost_rate) as avgCostRate,
                COUNT(DISTINCT r.id) as resourceCount
            FROM resource_assignments ra
            JOIN resources r ON ra.resource_id = r.id
            JOIN projects p ON ra.project_id = p.id
            LEFT JOIN departments d ON r.department_id = d.id
            LEFT JOIN resource_types rt ON r.type_id = rt.id
        `;

        const conditions = [];
        const params = [];
        let paramCount = 0;

        if (startDate && endDate) {
            conditions.push(`ra.start_date BETWEEN $${++paramCount} AND $${++paramCount}`);
            params.push(startDate, endDate);
        }

        if (department) {
            conditions.push(`r.department_id = $${++paramCount}`);
            params.push(department);
        }

        if (resourceType) {
            conditions.push(`r.type_id = $${++paramCount}`);
            params.push(resourceType);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY p.id, p.name, d.id, d.name, rt.id, rt.name ORDER BY actualCost DESC';

        const result = await db.all(query, params);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error('비용 분석 데이터 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '비용 분석 데이터를 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 부서별 성과 요약
 */
const getDepartmentPerformance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                d.name as departmentName,
                COUNT(DISTINCT r.id) as resourceCount,
                AVG(r.utilization) as avgUtilization,
                COUNT(DISTINCT t.id) as totalTasks,
                SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
                AVG(t.progress) as avgProgress,
                SUM(ra.actual_hours * r.cost_rate) as totalCost,
                AVG(r.cost_rate) as avgCostRate
            FROM departments d
            LEFT JOIN resources r ON d.id = r.department_id
            LEFT JOIN resource_assignments ra ON r.id = ra.resource_id
            LEFT JOIN tasks t ON ra.task_id = t.id
        `;

        const conditions = [];
        const params = [];
        let paramCount = 0;

        if (startDate && endDate) {
            conditions.push(`t.start_date BETWEEN $${++paramCount} AND $${++paramCount}`);
            params.push(startDate, endDate);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY d.id, d.name ORDER BY avgUtilization DESC';

        const result = await db.all(query, params);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error('부서별 성과 요약 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '부서별 성과 요약을 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 프로젝트별 리소스 할당 현황
 */
const getProjectResourceAllocation = async (req, res) => {
    try {
        const { projectId } = req.query;

        let query = `
            SELECT 
                p.name as projectName,
                r.name as resourceName,
                d.name as departmentName,
                rt.name as resourceTypeName,
                ra.allocation_percentage,
                ra.assigned_hours,
                ra.actual_hours,
                r.cost_rate,
                (ra.actual_hours * r.cost_rate) as actualCost
            FROM resource_assignments ra
            JOIN resources r ON ra.resource_id = r.id
            JOIN projects p ON ra.project_id = p.id
            LEFT JOIN departments d ON r.department_id = d.id
            LEFT JOIN resource_types rt ON r.type_id = rt.id
        `;

        const params = [];

        if (projectId) {
            query += ' WHERE p.id = $1';
            params.push(projectId);
        }

        query += ' ORDER BY p.name, r.name';

        const result = await db.all(query, params);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error('프로젝트별 리소스 할당 현황 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '프로젝트별 리소스 할당 현황을 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 월별 부하 분포 분석
 */
const getMonthlyLoadDistribution = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const query = `
            SELECT 
                TO_CHAR(wd.date, 'YYYY-MM') as month,
                AVG(wd.utilization_percentage) as avgUtilization,
                MAX(wd.utilization_percentage) as maxUtilization,
                MIN(wd.utilization_percentage) as minUtilization,
                COUNT(DISTINCT wd.resource_id) as activeResources,
                SUM(wd.workload_hours) as totalWorkloadHours
            FROM workload_data wd
            WHERE EXTRACT(YEAR FROM wd.date) = $1
            GROUP BY TO_CHAR(wd.date, 'YYYY-MM')
            ORDER BY month
        `;

        const result = await db.all(query, [year]);

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error('월별 부하 분포 분석 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '월별 부하 분포 분석을 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

module.exports = {
    getResourceUtilizationData,
    getLoadTrendsData,
    getTaskCompletionData,
    getCostAnalysisData,
    getDepartmentPerformance,
    getProjectResourceAllocation,
    getMonthlyLoadDistribution
};