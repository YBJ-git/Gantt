import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from '../../redux/store';
import TaskManagement from '../../pages/TaskManagement';
import { fetchTasks, updateTask } from '../../redux/actions/taskActions';
import { mockTasks } from '../mocks/taskData';

jest.mock('../../services/taskService', () => ({
  getTasks: jest.fn().mockResolvedValue({ data: mockTasks }),
  updateTask: jest.fn().mockResolvedValue({ success: true })
}));

describe('작업 관리 데이터 흐름 테스트', () => {
  let store;
  
  beforeEach(() => {
    store = configureStore();
  });
  
  test('작업 목록 불러오기 및 상태 업데이트', async () => {
    // 초기 상태에는 작업이 없음
    expect(store.getState().tasks.items).toEqual([]);
    
    // 작업 불러오기 액션 디스패치
    await store.dispatch(fetchTasks());
    
    // 상태에 작업이 추가되었는지 확인
    expect(store.getState().tasks.items).toEqual(mockTasks);
    
    // UI에 작업이 표시되는지 확인
    render(
      <Provider store={store}>
        <TaskManagement />
      </Provider>
    );
    
    await waitFor(() => {
      mockTasks.forEach(task => {
        expect(screen.getByText(task.name)).toBeInTheDocument();
      });
    });
  });
  
  test('작업 상태 변경 및 UI 업데이트', async () => {
    // 초기 상태 설정
    await store.dispatch(fetchTasks());
    
    render(
      <Provider store={store}>
        <TaskManagement />
      </Provider>
    );
    
    // 첫 번째 작업의 상태 변경 버튼 클릭
    const statusButton = screen.getByTestId(`change-status-${mockTasks[0].id}`);
    fireEvent.click(statusButton);
    
    // 상태 변경 옵션 선택
    const completeOption = screen.getByText('완료');
    fireEvent.click(completeOption);
    
    // 작업 업데이트 액션 확인
    await waitFor(() => {
      const updatedTask = store.getState().tasks.items.find(t => t.id === mockTasks[0].id);
      expect(updatedTask.status).toBe('완료');
    });
  });

  test('작업 필터링 기능', async () => {
    // 초기 상태 설정
    await store.dispatch(fetchTasks());
    
    render(
      <Provider store={store}>
        <TaskManagement />
      </Provider>
    );
    
    // 우선순위 필터 클릭
    const priorityFilter = screen.getByTestId('priority-filter');
    fireEvent.click(priorityFilter);
    
    // '높음' 우선순위 필터 선택
    const highPriorityOption = screen.getByText('높음');
    fireEvent.click(highPriorityOption);
    
    // 높은 우선순위 작업만 표시되는지 확인
    await waitFor(() => {
      // 높은 우선순위 작업 확인
      expect(screen.getByText('웹사이트 리디자인')).toBeInTheDocument();
      expect(screen.getByText('모바일 앱 업데이트')).toBeInTheDocument();
      
      // 중간 우선순위 작업은 표시되지 않음
      expect(screen.queryByText('데이터베이스 최적화')).not.toBeInTheDocument();
    });
  });
});
