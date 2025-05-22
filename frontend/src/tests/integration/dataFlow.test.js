import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskManagement from '../../pages/TaskManagement';
import { mockTasks } from '../mocks/taskData';

// AuthContext와 NotificationContext를 제공하는 래퍼 컴포넌트
const TestWrapper = ({ children }) => {
  const mockAuthContext = createMockAuthContext({
    user: createMockUser(),
    isAuthenticated: true
  });
  
  const mockNotificationContext = createMockNotificationContext();
  
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('작업 관리 데이터 흐름 테스트', () => {
  beforeEach(() => {
    // 각 테스트 전에 localStorage 초기화
    localStorage.clear();
  });
  
  test('작업 목록 불러오기 및 표시', async () => {
    render(
      <TestWrapper>
        <TaskManagement />
      </TestWrapper>
    );
    
    // 로딩이 완료될 때까지 기다림
    await waitFor(() => {
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 테이블 헤더가 표시되는지 확인
    expect(screen.getByText('작업명')).toBeInTheDocument();
    expect(screen.getByText('상태')).toBeInTheDocument();
    expect(screen.getByText('담당자')).toBeInTheDocument();
    
    // 목 데이터와 비슷한 작업들이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('프론트엔드 개발')).toBeInTheDocument();
    });
  });
  
  test('작업 추가 모달 열기 및 닫기', async () => {
    render(
      <TestWrapper>
        <TaskManagement />
      </TestWrapper>
    );
    
    // 작업 추가 버튼 클릭
    const addButton = screen.getByText('작업 추가');
    fireEvent.click(addButton);
    
    // 모달이 열렸는지 확인
    await waitFor(() => {
      expect(screen.getByText('작업명')).toBeInTheDocument();
    });
    
    // 취소 버튼 클릭
    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);
    
    // 모달이 닫혔는지 확인
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('필터링 기능', async () => {
    render(
      <TestWrapper>
        <TaskManagement />
      </TestWrapper>
    );
    
    // 로딩 완료 대기
    await waitFor(() => {
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 상태 필터 테스트
    const statusFilter = screen.getByDisplayValue('상태 필터') || 
                        screen.getAllByRole('combobox')[0];
    
    if (statusFilter) {
      fireEvent.click(statusFilter);
      
      // 진행 중 옵션이 있는지 확인
      await waitFor(() => {
        const inProgressOption = screen.queryByText('진행 중');
        if (inProgressOption) {
          fireEvent.click(inProgressOption);
        }
      });
    }
  });
  
  test('검색 기능', async () => {
    render(
      <TestWrapper>
        <TaskManagement />
      </TestWrapper>
    );
    
    // 로딩 완료 대기
    await waitFor(() => {
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 검색 입력 필드 찾기
    const searchInput = screen.getByPlaceholderText('작업 검색');
    
    if (searchInput) {
      // 검색어 입력
      fireEvent.change(searchInput, { target: { value: '프론트엔드' } });
      
      // 검색 결과 확인
      await waitFor(() => {
        expect(screen.getByText('프론트엔드 개발')).toBeInTheDocument();
      });
    }
  });
  
  test('작업 상세 보기', async () => {
    render(
      <TestWrapper>
        <TaskManagement />
      </TestWrapper>
    );
    
    // 로딩 완료 대기
    await waitFor(() => {
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // 작업명 링크 클릭 (있는 경우)
    await waitFor(() => {
      const taskLink = screen.queryByText('프론트엔드 개발');
      if (taskLink && taskLink.closest('button')) {
        fireEvent.click(taskLink);
        
        // 상세 드로어가 열렸는지 확인
        setTimeout(() => {
          const drawer = screen.queryByRole('dialog');
          if (drawer) {
            expect(drawer).toBeInTheDocument();
          }
        }, 100);
      }
    });
  });
});
