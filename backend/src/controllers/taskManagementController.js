/**
 * Task Management Controller
 * 작업 관리 관련 컨트롤러 (PostgreSQL 버전)
 */
const db = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * 모든 작업 조회
 */
const getAllTasks = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            priority, 
            resourceId, 
            projectId,
            startDate,
            endDate,
            search 
        } = req.query;

        let query = `
            SELECT 
                t.id, t.name, t.description, t.start_date, t.end_date,
                t.workload, t.status, t.priority, t.progress,
                t.estimated_hours, t.actual_hours,
                p.name as projectName,
                r.name as resourceName,
                STRING_AGG(td.predecessor_id::text, ',') as dependencies
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN resource_assignments ra ON t.id = ra.task_id
            LEFT JOIN resources r ON ra.resource_id = r.id
            LEFT JOIN task_dependencies td ON t.id = td.successor_id
        `;

        const conditions = [];
        const params = [];
        let paramCount = 0;

        // 필터 조건들
        if (status) {
            conditions.push(`t.status = $${++paramCount}`);
            params.push(status);
        }

        if (priority) {
            conditions.push(`t.priority = $${++paramCount}`);
            params.push(priority);
        }

        if (resourceId) {
            conditions.push(`ra.resource_id = $${++paramCount}`);
            params.push(resourceId);
        }

        if (projectId) {
            conditions.push(`t.project_id = $${++paramCount}`);
            params.push(projectId);
        }

        if (startDate && endDate) {
            conditions.push(`(t.start_date BETWEEN $${++paramCount} AND $${++paramCount} OR t.end_date BETWEEN $${++paramCount} AND $${++paramCount})`);
            params.push(startDate, endDate, startDate, endDate);
            paramCount += 2;
        }

        if (search) {
            conditions.push(`(t.name ILIKE $${++paramCount} OR t.description ILIKE $${++paramCount + 1})`);
            params.push(`%${search}%`, `%${search}%`);
            paramCount++;
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY t.id, p.name, r.name ORDER BY t.start_date DESC';

        // 페이지네이션
        const offset = (page - 1) * limit;
        query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
        params.push(parseInt(limit), offset);

        const tasks = await db.all(query, params);

        // 전체 개수 조회
        let countQuery = 'SELECT COUNT(DISTINCT t.id) as total FROM tasks t LEFT JOIN resource_assignments ra ON t.id = ra.task_id';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        
        const countResult = await db.all(countQuery, params.slice(0, -2));
        const totalCount = parseInt(countResult[0].total);

        // dependencies를 배열로 변환
        const tasksWithDependencies = tasks.map(task => ({
            ...task,
            dependencies: task.dependencies ? task.dependencies.split(',').map(dep => parseInt(dep)) : []
        }));

        res.status(200).json({
            success: true,
            count: tasks.length,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page),
            data: tasksWithDependencies
        });

    } catch (error) {
        logger.error('작업 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '작업 목록을 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 특정 작업 상세 조회
 */
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        // 기본 작업 정보
        const taskResult = await db.get(`
            SELECT 
                t.*, 
                p.name as projectName,
                r.name as resourceName
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN resource_assignments ra ON t.id = ra.task_id
            LEFT JOIN resources r ON ra.resource_id = r.id
            WHERE t.id = $1
        `, [id]);

        if (!taskResult) {
            return res.status(404).json({
                success: false,
                message: '해당 작업을 찾을 수 없습니다.'
            });
        }

        // 의존성 정보
        const dependenciesResult = await db.all(`
            SELECT td.predecessor_id, t.name as predecessorName
            FROM task_dependencies td
            JOIN tasks t ON td.predecessor_id = t.id
            WHERE td.successor_id = $1
        `, [id]);

        // 작업 히스토리
        const historyResult = await db.all(`
            SELECT * FROM task_history
            WHERE task_id = $1
            ORDER BY changed_at DESC
        `, [id]);

        // 작업 댓글
        const commentsResult = await db.all(`
            SELECT * FROM task_comments
            WHERE task_id = $1
            ORDER BY created_at DESC
        `, [id]);

        const task = {
            ...taskResult,
            dependencies: dependenciesResult,
            history: historyResult,
            comments: commentsResult
        };

        res.status(200).json({
            success: true,
            data: task
        });

    } catch (error) {
        logger.error('작업 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '작업 상세 정보를 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 작업 생성
 */
const createTask = async (req, res) => {
    try {
        const {
            name, description, project_id, start_date, end_date,
            workload, status, priority, progress, estimated_hours,
            resource_id, dependencies
        } = req.body;

        // 필수 필드 검증
        if (!name || !project_id || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: '필수 필드가 누락되었습니다.'
            });
        }

        // 작업 생성
        const taskResult = await db.execute(`
            INSERT INTO tasks 
            (name, description, project_id, start_date, end_date, workload, status, priority, progress, estimated_hours)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
        `, [name, description, project_id, start_date, end_date, workload || 0, status || 'planned', priority || 'medium', progress || 0, estimated_hours || 0]);

        const taskId = taskResult.id;

        // 리소스 할당
        if (resource_id) {
            await db.execute(`
                INSERT INTO resource_assignments 
                (task_id, resource_id, project_id, allocation_percentage, start_date, end_date, assigned_hours)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [taskId, resource_id, project_id, 100, start_date, end_date, workload || 0]);
        }

        // 의존성 설정
        if (dependencies && dependencies.length > 0) {
            for (const predecessorId of dependencies) {
                await db.execute(`
                    INSERT INTO task_dependencies (predecessor_id, successor_id, dependency_type)
                    VALUES ($1, $2, $3)
                `, [predecessorId, taskId, 'finish_to_start']);
            }
        }

        // 작업 히스토리 추가
        await db.execute(`
            INSERT INTO task_history (task_id, action_type, details, changed_by, old_values, new_values)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [taskId, 'created', '작업이 생성되었습니다.', 'System', null, JSON.stringify({ name, status: status || 'planned' })]);

        res.status(201).json({
            success: true,
            message: '작업이 성공적으로 생성되었습니다.',
            data: { id: taskId, ...req.body }
        });

    } catch (error) {
        logger.error('작업 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '작업 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 작업 수정
 */
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // 작업 존재 확인
        const existingTask = await db.get('SELECT * FROM tasks WHERE id = $1', [id]);
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: '해당 작업을 찾을 수 없습니다.'
            });
        }

        // 업데이트할 필드들 구성
        const allowedFields = ['name', 'description', 'start_date', 'end_date', 'workload', 'status', 'priority', 'progress', 'estimated_hours', 'actual_hours'];
        const updateFields = [];
        const updateValues = [];
        let paramCount = 0;

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                updateFields.push(`${key} = $${++paramCount}`);
                updateValues.push(updateData[key]);
            }
        });

        if (updateFields.length > 0) {
            updateValues.push(id);
            const updateQuery = `UPDATE tasks SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${++paramCount}`;
            await db.execute(updateQuery, updateValues);

            // 작업 히스토리 추가
            await db.execute(`
                INSERT INTO task_history (task_id, action_type, details, changed_by, old_values, new_values)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [id, 'updated', '작업이 업데이트되었습니다.', 'System', JSON.stringify(existingTask), JSON.stringify(updateData)]);
        }

        res.status(200).json({
            success: true,
            message: '작업이 성공적으로 업데이트되었습니다.'
        });

    } catch (error) {
        logger.error('작업 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '작업 수정 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 작업 삭제
 */
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        // 작업 존재 확인
        const existingTask = await db.get('SELECT id FROM tasks WHERE id = $1', [id]);
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: '해당 작업을 찾을 수 없습니다.'
            });
        }

        // CASCADE 설정으로 관련 데이터 자동 삭제
        await db.execute('DELETE FROM tasks WHERE id = $1', [id]);

        res.status(200).json({
            success: true,
            message: '작업이 성공적으로 삭제되었습니다.'
        });

    } catch (error) {
        logger.error('작업 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '작업 삭제 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 작업 댓글 추가
 */
const addTaskComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, user_name } = req.body;

        if (!content || !user_name) {
            return res.status(400).json({
                success: false,
                message: '댓글 내용과 사용자명이 필요합니다.'
            });
        }

        // 작업 존재 확인
        const existingTask = await db.get('SELECT id FROM tasks WHERE id = $1', [id]);
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: '해당 작업을 찾을 수 없습니다.'
            });
        }

        // 댓글 추가
        const commentResult = await db.execute(`
            INSERT INTO task_comments (task_id, user_name, content)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [id, user_name, content]);

        res.status(201).json({
            success: true,
            message: '댓글이 성공적으로 추가되었습니다.',
            data: { id: commentResult.id, task_id: id, user_name, content }
        });

    } catch (error) {
        logger.error('작업 댓글 추가 오류:', error);
        res.status(500).json({
            success: false,
            message: '댓글 추가 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 프로젝트 목록 조회
 */
const getProjects = async (req, res) => {
    try {
        const projects = await db.all('SELECT * FROM projects ORDER BY name');
        
        res.status(200).json({
            success: true,
            data: projects
        });

    } catch (error) {
        logger.error('프로젝트 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '프로젝트 목록을 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    addTaskComment,
    getProjects
};