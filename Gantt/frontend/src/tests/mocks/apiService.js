// API 서비스 모의 객체
import { mockTasks, mockResources } from './taskData';

// 작업 관련 API 서비스
export const taskService = {
  getTasks: () => Promise.resolve({ data: mockTasks }),
  
  getTask: (id) => {
    const task = mockTasks.find(t => t.id === id);
    return Promise.resolve({ data: task });
  },
  
  createTask: (taskData) => {
    const newTask = {
      id: mockTasks.length + 1,
      ...taskData,
      dependencies: taskData.dependencies || []
    };
    return Promise.resolve({ data: newTask, success: true });
  },
  
  updateTask: (id, updates) => {
    const task = mockTasks.find(t => t.id === id);
    const updatedTask = { ...task, ...updates };
    return Promise.resolve({ data: updatedTask, success: true });
  },
  
  deleteTask: (id) => Promise.resolve({ success: true }),
  
  optimizeWorkload: (params) => {
    // 부하 최적화 결과를 시뮬레이션
    const optimizedTasks = mockTasks.map(task => ({
      ...task,
      startDate: new Date(task.startDate), 
      endDate: new Date(task.endDate)
    }));
    
    return Promise.resolve({
      data: {
        optimizedWorkload: optimizedTasks,
        before: {
          maxWorkload: 80,
          avgWorkload: 60,
          stdDeviation: 20
        },
        after: {
          maxWorkload: 70,
          avgWorkload: 60,
          stdDeviation: 10
        }
      },
      success: true
    });
  }
};

// 리소스 관련 API 서비스
export const resourceService = {
  getResources: () => Promise.resolve({ data: mockResources }),
  
  getResource: (id) => {
    const resource = mockResources.find(r => r.id === id);
    return Promise.resolve({ data: resource });
  },
  
  createResource: (resourceData) => {
    const newResource = {
      id: mockResources.length + 1,
      ...resourceData
    };
    return Promise.resolve({ data: newResource, success: true });
  },
  
  updateResource: (id, updates) => {
    const resource = mockResources.find(r => r.id === id);
    const updatedResource = { ...resource, ...updates };
    return Promise.resolve({ data: updatedResource, success: true });
  },
  
  deleteResource: (id) => Promise.resolve({ success: true })
};

// 대시보드 관련 API 서비스
export const dashboardService = {
  getSummary: () => {
    return Promise.resolve({
      data: {
        workloadSummary: {
          totalTasks: mockTasks.length,
          completedTasks: mockTasks.filter(t => t.status === '완료').length,
          pendingTasks: mockTasks.filter(t => t.status === '대기중').length,
          inProgressTasks: mockTasks.filter(t => t.status === '진행중').length
        },
        resourceUtilization: mockResources.map(r => ({
          id: r.id,
          name: r.name,
          capacity: r.capacity,
          usage: Math.floor(Math.random() * 100)
        }))
      }
    });
  }
};
