import React, { useState, useEffect } from 'react';
import { useRole } from 'contexts/RoleContext';
import { useAuth } from 'contexts/AuthContext';
import taskService from 'services/taskService';
import './TaskManager.css';

const TaskManager = () => {
  const { user } = useAuth();
  const { hasPermission } = useRole();
  
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 작업 편집 상태
  const [editMode, setEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  
  // 작업 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    tags: []
  });
  
  // 작업 목록 로드
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // 권한에 따라 다른 API 호출
        let taskData;
        
        if (hasPermission('view_all_projects')) {
          // 관리자/매니저는 모든 작업 조회
          taskData = await taskService.getAllTasks();
        } else if (hasPermission('view_department_projects')) {
          // 부서 매니저는 부서 작업 조회
          taskData = await taskService.getDepartmentTasks(user.departmentId);
        } else if (hasPermission('view_assigned_tasks')) {
          // 작업자는 할당된 작업 조회
          taskData = await taskService.getUserTasks(user.id);
        } else {
          // 기본 사용자는 공개 작업만 조회
          taskData = await taskService.getPublicTasks();
        }
        
        setTasks(taskData);
        setFilteredTasks(taskData);
      } catch (err) {
        setError(err.message || '작업 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [user, hasPermission]);
  
  // 필터링 적용
  useEffect(() => {
    let result = [...tasks];
    
    // 검색어 필터
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(lowerSearchTerm) ||
        task.description.toLowerCase().includes(lowerSearchTerm) ||
        (task.assignee && task.assignee.name && 
         task.assignee.name.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // 상태 필터
    if (statusFilter) {
      result = result.filter(task => task.status === statusFilter);
    }
    
    setFilteredTasks(result);
  }, [tasks, searchTerm, statusFilter]);
  
  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 태그 추가 핸들러
  const handleAddTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };
  
  // 태그 삭제 핸들러
  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  // 작업 생성/수정 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      let result;
      
      if (editMode && currentTask) {
        // 작업 수정
        result = await taskService.updateTask(currentTask.id, formData);
        setTasks(prev => 
          prev.map(task => task.id === currentTask.id ? result : task)
        );
        setSuccessMessage('작업이 성공적으로 수정되었습니다.');
      } else {
        // 새 작업 생성
        result = await taskService.createTask(formData);
        setTasks(prev => [...prev, result]);
        setSuccessMessage('새 작업이 성공적으로 생성되었습니다.');
      }
      
      // 폼 초기화
      resetForm();
    } catch (err) {
      setError(err.message || '작업을 저장하는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 작업 편집 핸들러
  const handleEditTask = (task) => {
    if (!hasPermission('edit_task')) return;
    
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignee: task.assignee ? task.assignee.id : '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority,
      status: task.status,
      tags: task.tags || []
    });
    setEditMode(true);
  };
  
  // 작업 삭제 핸들러
  const handleDeleteTask = async (taskId) => {
    if (!hasPermission('delete_task')) return;
    
    if (!window.confirm('이 작업을 삭제하시겠습니까? 이 작업은 복구할 수 없습니다.')) {
      return;
    }
    
    try {
      setLoading(true);
      await taskService.deleteTask(taskId);
      
      // 작업 목록에서 제거
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setSuccessMessage('작업이 성공적으로 삭제되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message || '작업을 삭제하는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 폼 초기화
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending',
      tags: []
    });
    setCurrentTask(null);
    setEditMode(false);
  };
  
  // 작업 상태에 따른 배지 클래스
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };
  
  // 작업 우선순위에 따른 배지 클래스
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };
  
  if (loading) {
    return <div className="loading-container">작업 정보를 불러오는 중...</div>;
  }
  
  return (
    <div className="task-manager-container">
      <div className="task-manager-header">
        <h1>작업 관리</h1>
        <p className="text-muted">모든 작업과 진행 상황을 관리합니다</p>
      </div>
      
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      
      <div className="task-manager-content">
        <div className="task-list-section">
          <div className="card shadow-md">
            <div className="card-header">
              <h2>작업 목록</h2>
              
              <div className="filters-container">
                <div className="search-container">
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="작업명, 설명, 담당자로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="search-icon">🔍</i>
                </div>
                
                <div className="status-filter-container">
                  <select
                    className="form-control"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">모든 상태</option>
                    <option value="pending">대기 중</option>
                    <option value="in_progress">진행 중</option>
                    <option value="completed">완료</option>
                    <option value="cancelled">취소됨</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="card-body">
              {filteredTasks.length > 0 ? (
                <div className="task-list">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="task-card">
                      <div className="task-card-header">
                        <h3 className="task-title">{task.title}</h3>
                        <div className="task-badges">
                          <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                            {task.status === 'completed' ? '완료' :
                             task.status === 'in_progress' ? '진행 중' :
                             task.status === 'pending' ? '대기 중' : '취소됨'}
                          </span>
                          <span className={`priority-badge ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority === 'high' ? '높음' :
                             task.priority === 'medium' ? '중간' : '낮음'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="task-card-body">
                        <p className="task-description">{task.description}</p>
                        
                        {task.assignee && (
                          <div className="task-assignee">
                            <span className="assignee-label">담당자:</span>
                            <span className="assignee-name">{task.assignee.name}</span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className="task-due-date">
                            <span className="due-date-label">마감일:</span>
                            <span className="due-date-value">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        
                        {task.tags && task.tags.length > 0 && (
                          <div className="task-tags">
                            {task.tags.map((tag, index) => (
                              <span key={index} className="task-tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="task-card-actions">
                        {hasPermission('edit_task') && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditTask(task)}
                          >
                            수정
                          </button>
                        )}
                        
                        {hasPermission('delete_task') && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-tasks-message">
                  <p>등록된 작업이 없습니다.</p>
                  {hasPermission('create_task') && (
                    <p>아래에서 새 작업을 추가하세요.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 작업 생성/수정 폼 - 권한이 있는 경우에만 표시 */}
        {(hasPermission('create_task') || hasPermission('edit_task')) && (
          <div className="task-form-section">
            <div className="card shadow-md">
              <div className="card-header">
                <h2>{editMode ? '작업 수정' : '새 작업 추가'}</h2>
              </div>
              
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="title" className="form-label">
                      제목 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="form-control"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="작업 제목"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description" className="form-label">
                      설명 <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="작업에 대한 상세 설명"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label htmlFor="assignee" className="form-label">담당자</label>
                      <select
                        id="assignee"
                        name="assignee"
                        className="form-control"
                        value={formData.assignee}
                        onChange={handleInputChange}
                      >
                        <option value="">담당자 선택</option>
                        {/* 실제로는 API에서 가져온 작업자 목록을 여기에 표시 */}
                        <option value="1">김작업</option>
                        <option value="2">이매니저</option>
                        <option value="3">박개발</option>
                      </select>
                    </div>
                    
                    <div className="form-group col-md-6">
                      <label htmlFor="dueDate" className="form-label">마감일</label>
                      <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        className="form-control"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label htmlFor="priority" className="form-label">우선순위</label>
                      <select
                        id="priority"
                        name="priority"
                        className="form-control"
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        <option value="low">낮음</option>
                        <option value="medium">중간</option>
                        <option value="high">높음</option>
                      </select>
                    </div>
                    
                    <div className="form-group col-md-6">
                      <label htmlFor="status" className="form-label">상태</label>
                      <select
                        id="status"
                        name="status"
                        className="form-control"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="pending">대기 중</option>
                        <option value="in_progress">진행 중</option>
                        <option value="completed">완료</option>
                        <option value="cancelled">취소됨</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">태그</label>
                    <div className="tag-input-container">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="태그 입력 후 Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                    
                    <div className="tags-container">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                          <button
                            type="button"
                            className="tag-remove"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? '처리 중...' : editMode ? '작업 수정' : '작업 추가'}
                    </button>
                    
                    {editMode && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={resetForm}
                      >
                        취소
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
