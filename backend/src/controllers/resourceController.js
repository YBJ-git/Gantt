/**
 * Resource Controller
 * 리소스 관리 관련 컨트롤러
 */
const db = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * 모든 리소스 조회
 */
const getAllResources = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            department, 
            type, 
            availability, 
            search,
            loadMin,
            loadMax
        } = req.query;

        let query = `
            SELECT 
                r.id, r.name, r.email, r.phone, r.location,
                r.capacity, r.utilization, r.cost_rate,
                r.available_from, r.available_to, r.description,
                d.name as departmentName,
                rt.name as typeName,
                STRING_AGG(s.name, ',') as skills
            FROM resources r
            LEFT JOIN departments d ON r.department_id = d.id
            LEFT JOIN resource_types rt ON r.type_id = rt.id
            LEFT JOIN resource_skills rs ON r.id = rs.resource_id
            LEFT JOIN skills s ON rs.skill_id = s.id
        `;

        const conditions = [];
        const params = [];
        let paramCount = 0;

        // 부서 필터
        if (department) {
            conditions.push(`r.department_id = $${++paramCount}`);
            params.push(department);
        }

        // 유형 필터
        if (type) {
            conditions.push(`r.type_id = $${++paramCount}`);
            params.push(type);
        }

        // 가용성 필터
        if (availability === 'available') {
            conditions.push("r.available_from <= CURRENT_DATE AND r.available_to >= CURRENT_DATE");
        } else if (availability === 'unavailable') {
            conditions.push("r.available_from > CURRENT_DATE OR r.available_to < CURRENT_DATE");
        }

        // 부하 범위 필터
        if (loadMin !== undefined) {
            conditions.push(`r.utilization >= $${++paramCount}`);
            params.push(loadMin);
        }
        if (loadMax !== undefined) {
            conditions.push(`r.utilization <= $${++paramCount}`);
            params.push(loadMax);
        }

        // 검색 필터
        if (search) {
            conditions.push(`(r.name ILIKE $${++paramCount} OR r.email ILIKE $${++paramCount + 1} OR r.location ILIKE $${++paramCount + 2})`);
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            paramCount += 3;
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY r.id, d.name, rt.name ORDER BY r.name';

        // 페이지네이션
        const offset = (page - 1) * limit;
        query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
        params.push(parseInt(limit), offset);

        const resources = await db.all(query, params);

        // 전체 개수 조회
        let countQuery = 'SELECT COUNT(*) as total FROM resources r';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        
        const countResult = await db.all(countQuery, params.slice(0, -2)); // LIMIT, OFFSET 제외
        const totalCount = parseInt(countResult[0].total);

        // skills를 배열로 변환
        const resourcesWithSkills = resources.map(resource => ({
            ...resource,
            skills: resource.skills ? resource.skills.split(',') : []
        }));

        res.status(200).json({
            success: true,
            count: resources.length,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page),
            data: resourcesWithSkills
        });

    } catch (error) {
        logger.error('리소스 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '리소스 목록을 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 특정 리소스 상세 조회
 */
const getResourceById = async (req, res) => {
    try {
        const { id } = req.params;

        // 기본 리소스 정보
        const resourceResult = await db.get(`
            SELECT 
                r.*, 
                d.name as departmentName,
                rt.name as typeName
            FROM resources r
            LEFT JOIN departments d ON r.department_id = d.id
            LEFT JOIN resource_types rt ON r.type_id = rt.id
            WHERE r.id = $1
        `, [id]);

        if (!resourceResult) {
            return res.status(404).json({
                success: false,
                message: '해당 리소스를 찾을 수 없습니다.'
            });
        }

        // 스킬 정보
        const skillsResult = await db.all(`
            SELECT s.name, rs.proficiency_level
            FROM resource_skills rs
            JOIN skills s ON rs.skill_id = s.id
            WHERE rs.resource_id = $1
        `, [id]);

        // 할당된 작업들
        const assignmentsResult = await db.all(`
            SELECT 
                ra.*, 
                t.name as taskName,
                p.name as projectName
            FROM resource_assignments ra
            JOIN tasks t ON ra.task_id = t.id
            JOIN projects p ON ra.project_id = p.id
            WHERE ra.resource_id = $1
            ORDER BY ra.start_date DESC
        `, [id]);

        // 월별 부하 데이터
        const monthlyLoadResult = await db.all(`
            SELECT 
                TO_CHAR(date, 'YYYY-MM') as month,
                AVG(utilization_percentage) as load
            FROM workload_data
            WHERE resource_id = $1
            GROUP BY TO_CHAR(date, 'YYYY-MM')
            ORDER BY month DESC
            LIMIT 12
        `, [id]);

        const resource = {
            ...resourceResult,
            skills: skillsResult,
            assignments: assignmentsResult,
            monthlyLoads: monthlyLoadResult
        };

        res.status(200).json({
            success: true,
            data: resource
        });

    } catch (error) {
        logger.error('리소스 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '리소스 상세 정보를 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 리소스 생성
 */
const createResource = async (req, res) => {
    try {
        const {
            name, email, phone, location, department_id, type_id,
            capacity, cost_rate, available_from, available_to,
            description, skills
        } = req.body;

        // 필수 필드 검증
        if (!name || !email || !department_id || !type_id) {
            return res.status(400).json({
                success: false,
                message: '필수 필드가 누락되었습니다.'
            });
        }

        // 리소스 생성
        const resourceResult = await db.execute(`
            INSERT INTO resources 
            (name, email, phone, location, department_id, type_id, capacity, cost_rate, available_from, available_to, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
        `, [name, email, phone, location, department_id, type_id, capacity || 40, cost_rate || 0, available_from, available_to, description]);

        const resourceId = resourceResult.id;

        // 스킬 할당
        if (skills && skills.length > 0) {
            for (const skillName of skills) {
                // 스킬이 없으면 생성
                await db.execute(`
                    INSERT INTO skills (name, category) VALUES ($1, $2)
                    ON CONFLICT (name) DO NOTHING
                `, [skillName, 'General']);

                // 스킬 ID 조회
                const skill = await db.get('SELECT id FROM skills WHERE name = $1', [skillName]);
                
                if (skill) {
                    // 리소스-스킬 연결
                    await db.execute(`
                        INSERT INTO resource_skills (resource_id, skill_id, proficiency_level)
                        VALUES ($1, $2, $3)
                    `, [resourceId, skill.id, 3]); // 기본 숙련도 3
                }
            }
        }

        res.status(201).json({
            success: true,
            message: '리소스가 성공적으로 생성되었습니다.',
            data: { id: resourceId, ...req.body }
        });

    } catch (error) {
        logger.error('리소스 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '리소스 생성 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 리소스 수정
 */
const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // 리소스 존재 확인
        const existingResource = await db.get('SELECT id FROM resources WHERE id = $1', [id]);
        if (!existingResource) {
            return res.status(404).json({
                success: false,
                message: '해당 리소스를 찾을 수 없습니다.'
            });
        }

        // 업데이트할 필드들 구성
        const allowedFields = ['name', 'email', 'phone', 'location', 'department_id', 'type_id', 'capacity', 'cost_rate', 'available_from', 'available_to', 'description'];
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
            const updateQuery = `UPDATE resources SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${++paramCount}`;
            await db.execute(updateQuery, updateValues);
        }

        // 스킬 업데이트
        if (updateData.skills) {
            // 기존 스킬 연결 삭제
            await db.execute('DELETE FROM resource_skills WHERE resource_id = $1', [id]);

            // 새 스킬 연결
            for (const skillName of updateData.skills) {
                await db.execute(`INSERT INTO skills (name, category) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`, [skillName, 'General']);
                
                const skill = await db.get('SELECT id FROM skills WHERE name = $1', [skillName]);
                if (skill) {
                    await db.execute(`
                        INSERT INTO resource_skills (resource_id, skill_id, proficiency_level)
                        VALUES ($1, $2, $3)
                    `, [id, skill.id, 3]);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: '리소스가 성공적으로 업데이트되었습니다.'
        });

    } catch (error) {
        logger.error('리소스 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '리소스 수정 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 리소스 삭제
 */
const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;

        // 리소스 존재 확인
        const existingResource = await db.get('SELECT id FROM resources WHERE id = $1', [id]);
        if (!existingResource) {
            return res.status(404).json({
                success: false,
                message: '해당 리소스를 찾을 수 없습니다.'
            });
        }

        // CASCADE 설정으로 관련 데이터 자동 삭제
        await db.execute('DELETE FROM resources WHERE id = $1', [id]);

        res.status(200).json({
            success: true,
            message: '리소스가 성공적으로 삭제되었습니다.'
        });

    } catch (error) {
        logger.error('리소스 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '리소스 삭제 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 부서 목록 조회
 */
const getDepartments = async (req, res) => {
    try {
        const departments = await db.all('SELECT * FROM departments ORDER BY name');
        
        res.status(200).json({
            success: true,
            data: departments
        });

    } catch (error) {
        logger.error('부서 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '부서 목록을 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

/**
 * 리소스 유형 목록 조회
 */
const getResourceTypes = async (req, res) => {
    try {
        const resourceTypes = await db.all('SELECT * FROM resource_types ORDER BY name');
        
        res.status(200).json({
            success: true,
            data: resourceTypes
        });

    } catch (error) {
        logger.error('리소스 유형 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '리소스 유형 목록을 가져오는 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};

module.exports = {
    getAllResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    getDepartments,
    getResourceTypes
};