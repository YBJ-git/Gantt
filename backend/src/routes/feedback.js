const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');
const { logger } = require('../utils/logger');

const router = express.Router();

// 임시 메모리 저장소 (실제 환경에서는 데이터베이스 사용)
let feedbacks = [];
let feedbackCounter = 1;

// 검증 규칙
const feedbackValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('제목은 1-200자 사이여야 합니다.'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('설명은 10-2000자 사이여야 합니다.'),
  body('type').isIn(['bug', 'feature', 'ui', 'general']).withMessage('유효하지 않은 피드백 타입입니다.'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('유효하지 않은 우선순위입니다.'),
  body('satisfaction').isInt({ min: 1, max: 5 }).withMessage('만족도는 1-5 사이의 값이어야 합니다.')
];

// 피드백 제출
router.post('/', authenticateJWT, feedbackValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 유효하지 않습니다.',
        errors: errors.array()
      });
    }

    const feedbackData = {
      id: feedbackCounter++,
      ...req.body,
      userId: req.user.id,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: [],
      tags: [],
      assignee: null
    };

    feedbacks.push(feedbackData);

    // WebSocket을 통해 관리자에게 새 피드백 알림
    if (req.app.wsServer) {
      req.app.wsServer.broadcast({
        type: 'notification',
        data: {
          title: '새 피드백 도착',
          message: `${req.user.username}님이 새 피드백을 보냈습니다: ${feedbackData.title}`,
          type: 'feedback',
          feedbackId: feedbackData.id,
          from: req.user
        }
      });
    }

    logger.info(`새 피드백 생성: ${feedbackData.id} by ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: '피드백이 성공적으로 제출되었습니다.',
      data: {
        id: feedbackData.id,
        status: feedbackData.status,
        createdAt: feedbackData.createdAt
      }
    });
  } catch (error) {
    logger.error('피드백 제출 오류:', error);
    res.status(500).json({
      success: false,
      message: '피드백 제출에 실패했습니다.'
    });
  }
});

// 피드백 목록 조회
router.get('/', authenticateJWT, authorizeRoles(['admin', 'manager']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      userId,
      assignee,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filteredFeedbacks = [...feedbacks];

    // 필터링
    if (status) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.status === status);
    }
    if (type) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.type === type);
    }
    if (priority) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.priority === priority);
    }
    if (userId) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.userId === parseInt(userId));
    }
    if (assignee) {
      filteredFeedbacks = filteredFeedbacks.filter(f => f.assignee === parseInt(assignee));
    }

    // 정렬
    filteredFeedbacks.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        feedbacks: paginatedFeedbacks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredFeedbacks.length,
          totalPages: Math.ceil(filteredFeedbacks.length / limit)
        }
      }
    });
  } catch (error) {
    logger.error('피드백 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '피드백 목록 조회에 실패했습니다.'
    });
  }
});

// 특정 피드백 조회
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const feedback = feedbacks.find(f => f.id === feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: '해당 피드백을 찾을 수 없습니다.'
      });
    }

    // 본인 피드백이거나 관리자/매니저인 경우만 조회 가능
    if (feedback.userId !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '이 피드백을 볼 권한이 없습니다.'
      });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error('피드백 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '피드백 조회에 실패했습니다.'
    });
  }
});

// 피드백 상태 업데이트
router.patch('/:id/status', authenticateJWT, authorizeRoles(['admin', 'manager']), async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { status, comment } = req.body;

    const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상태입니다.'
      });
    }

    const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);
    if (feedbackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '해당 피드백을 찾을 수 없습니다.'
      });
    }

    feedbacks[feedbackIndex].status = status;
    feedbacks[feedbackIndex].updatedAt = new Date();

    if (comment) {
      feedbacks[feedbackIndex].responses.push({
        id: Date.now(),
        userId: req.user.id,
        username: req.user.username,
        content: comment,
        type: 'status_change',
        createdAt: new Date()
      });
    }

    // 피드백 작성자에게 상태 변경 알림
    if (req.app.wsServer) {
      req.app.wsServer.sendToUser(feedbacks[feedbackIndex].userId, {
        type: 'notification',
        data: {
          title: '피드백 상태 변경',
          message: `귀하의 피드백 상태가 "${status}"로 변경되었습니다.`,
          type: 'feedback_update',
          feedbackId: feedbackId
        }
      });
    }

    logger.info(`피드백 상태 변경: ${feedbackId} -> ${status} by ${req.user.username}`);

    res.json({
      success: true,
      message: '피드백 상태가 성공적으로 업데이트되었습니다.',
      data: feedbacks[feedbackIndex]
    });
  } catch (error) {
    logger.error('피드백 상태 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '피드백 상태 업데이트에 실패했습니다.'
    });
  }
});

// 피드백에 응답 추가
router.post('/:id/response', authenticateJWT, authorizeRoles(['admin', 'manager']), async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { content, isPublic = true } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '응답 내용을 입력해 주세요.'
      });
    }

    const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);
    if (feedbackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '해당 피드백을 찾을 수 없습니다.'
      });
    }

    const response = {
      id: Date.now(),
      userId: req.user.id,
      username: req.user.username,
      content: content.trim(),
      type: 'response',
      isPublic,
      createdAt: new Date()
    };

    feedbacks[feedbackIndex].responses.push(response);
    feedbacks[feedbackIndex].updatedAt = new Date();

    // 피드백 작성자에게 응답 알림
    if (req.app.wsServer && isPublic) {
      req.app.wsServer.sendToUser(feedbacks[feedbackIndex].userId, {
        type: 'notification',
        data: {
          title: '피드백 응답 도착',
          message: `귀하의 피드백에 응답이 등록되었습니다.`,
          type: 'feedback_response',
          feedbackId: feedbackId
        }
      });
    }

    logger.info(`피드백 응답 추가: ${feedbackId} by ${req.user.username}`);

    res.json({
      success: true,
      message: '응답이 성공적으로 추가되었습니다.',
      data: response
    });
  } catch (error) {
    logger.error('피드백 응답 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '피드백 응답 추가에 실패했습니다.'
    });
  }
});

// 피드백 통계 조회
router.get('/stats/overview', authenticateJWT, authorizeRoles(['admin', 'manager']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filteredFeedbacks = [...feedbacks];

    // 날짜 필터링
    if (startDate || endDate) {
      filteredFeedbacks = filteredFeedbacks.filter(f => {
        const feedbackDate = new Date(f.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && feedbackDate < start) return false;
        if (end && feedbackDate > end) return false;
        return true;
      });
    }

    // 통계 계산
    const stats = {
      total: filteredFeedbacks.length,
      byStatus: {},
      byType: {},
      byPriority: {},
      averageSatisfaction: 0,
      responseTime: {
        average: 0,
        median: 0
      }
    };

    // 상태별 통계
    filteredFeedbacks.forEach(f => {
      stats.byStatus[f.status] = (stats.byStatus[f.status] || 0) + 1;
      stats.byType[f.type] = (stats.byType[f.type] || 0) + 1;
      stats.byPriority[f.priority] = (stats.byPriority[f.priority] || 0) + 1;
    });

    // 평균 만족도
    if (filteredFeedbacks.length > 0) {
      const totalSatisfaction = filteredFeedbacks.reduce((sum, f) => sum + f.satisfaction, 0);
      stats.averageSatisfaction = totalSatisfaction / filteredFeedbacks.length;
    }

    // 응답 시간 계산 (간단한 버전)
    const resolvedFeedbacks = filteredFeedbacks.filter(f => 
      f.status === 'resolved' && f.responses.length > 0
    );

    if (resolvedFeedbacks.length > 0) {
      const responseTimes = resolvedFeedbacks.map(f => {
        const firstResponse = f.responses[0];
        const responseTime = new Date(firstResponse.createdAt) - new Date(f.createdAt);
        return responseTime / (1000 * 60 * 60); // 시간 단위
      });

      stats.responseTime.average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      
      const sortedTimes = responseTimes.sort((a, b) => a - b);
      const mid = Math.floor(sortedTimes.length / 2);
      stats.responseTime.median = sortedTimes.length % 2 !== 0 
        ? sortedTimes[mid] 
        : (sortedTimes[mid - 1] + sortedTimes[mid]) / 2;
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('피드백 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '피드백 통계 조회에 실패했습니다.'
    });
  }
});

// 피드백 검색
router.get('/search', authenticateJWT, async (req, res) => {
  try {
    const { q, type, status, priority } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '검색어를 입력해 주세요.'
      });
    }

    let results = feedbacks.filter(f => {
      // 본인 피드백이거나 관리자/매니저인 경우만 검색 가능
      if (f.userId !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
        return false;
      }

      // 텍스트 검색
      const searchText = q.toLowerCase();
      const titleMatch = f.title.toLowerCase().includes(searchText);
      const descriptionMatch = f.description.toLowerCase().includes(searchText);
      
      if (!titleMatch && !descriptionMatch) {
        return false;
      }

      // 필터 적용
      if (type && f.type !== type) return false;
      if (status && f.status !== status) return false;
      if (priority && f.priority !== priority) return false;

      return true;
    });

    res.json({
      success: true,
      data: {
        query: q,
        results,
        count: results.length
      }
    });
  } catch (error) {
    logger.error('피드백 검색 오류:', error);
    res.status(500).json({
      success: false,
      message: '피드백 검색에 실패했습니다.'
    });
  }
});

// 피드백 할당
router.patch('/:id/assign', authenticateJWT, authorizeRoles(['admin', 'manager']), async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const { assigneeId } = req.body;

    const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);
    if (feedbackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '해당 피드백을 찾을 수 없습니다.'
      });
    }

    feedbacks[feedbackIndex].assignee = assigneeId;
    feedbacks[feedbackIndex].updatedAt = new Date();

    // 할당된 사용자에게 알림
    if (assigneeId && req.app.wsServer) {
      req.app.wsServer.sendToUser(assigneeId, {
        type: 'notification',
        data: {
          title: '피드백 할당',
          message: `새로운 피드백이 할당되었습니다: ${feedbacks[feedbackIndex].title}`,
          type: 'feedback_assignment',
          feedbackId: feedbackId
        }
      });
    }

    logger.info(`피드백 할당: ${feedbackId} -> ${assigneeId} by ${req.user.username}`);

    res.json({
      success: true,
      message: '피드백이 성공적으로 할당되었습니다.',
      data: feedbacks[feedbackIndex]
    });
  } catch (error) {
    logger.error('피드백 할당 오류:', error);
    res.status(500).json({
      success: false,
      message: '피드백 할당에 실패했습니다.'
    });
  }
});

// 피드백 삭제
router.delete('/:id', authenticateJWT, authorizeRoles(['admin']), async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.id);
    const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);

    if (feedbackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '해당 피드백을 찾을 수 없습니다.'
      });
    }

    const deletedFeedback = feedbacks.splice(feedbackIndex, 1)[0];

    logger.info(`피드백 삭제: ${feedbackId} by ${req.user.username}`);

    res.json({
      success: true,
      message: '피드백이 성공적으로 삭제되었습니다.',
      data: { id: deletedFeedback.id }
    });
  } catch (error) {
    logger.error('피드백 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '피드백 삭제에 실패했습니다.'
    });
  }
});

module.exports = router;