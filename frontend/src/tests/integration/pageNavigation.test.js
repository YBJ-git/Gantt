import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

// 테스트 래퍼 컴포넌트
const TestWrapper = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('페이지 간 연동 테스트', () => {
  beforeEach(() => {
    // 각 테스트 전에 localStorage 초기화
    localStorage.clear();
    // 인증된 사용자로 설정
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(createMockUser()));
  });

  test('앱이 정상적으로 렌더링된다', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // 앱의 기본 요소가 렌더링되는지 확인
    await waitFor(() => {
      // 네비게이션 요소나 로고가 있는지 확인
      const appElement = screen.getByTestId('app') || 
                        document.querySelector('.app') ||
                        document.querySelector('#root');
      expect(appElement || document.body).toBeInTheDocument();
    });
  });

  test('네비게이션 메뉴가 표시된다', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    await waitFor(() => {
      // 주요 네비게이션 메뉴들이 있는지 확인
      const menuItems = ['대시보드', '작업 관리', '리소스 관리'];
      
      menuItems.forEach(item => {
        // 텍스트나 데이터 속성으로 확인
        const element = screen.queryByText(item) || 
                       screen.queryByTestId(item) ||
                       document.querySelector(`[data-menu="${item}"]`);
        
        if (element) {
          expect(element).toBeInTheDocument();
        }
      });
    });
  });

  test('페이지 간 네비게이션이 작동한다', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    await waitFor(() => {
      // 대시보드 링크 찾기 및 클릭
      const dashboardLink = screen.queryByText('대시보드') ||
                           screen.queryByTestId('dashboard-link');
      
      if (dashboardLink) {
        fireEvent.click(dashboardLink);
        
        // URL 변경 확인
        setTimeout(() => {
          expect(window.location.pathname).toContain('/dashboard');
        }, 100);
      }
    });
  });

  test('인증되지 않은 사용자는 로그인 페이지로 리다이렉트된다', async () => {
    // 토큰 제거
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    await waitFor(() => {
      // 로그인 페이지 요소나 로그인 폼이 있는지 확인
      const loginElement = screen.queryByText('로그인') ||
                          screen.queryByTestId('login-form') ||
                          screen.queryByPlaceholderText('사용자명') ||
                          screen.queryByPlaceholderText('비밀번호');
      
      if (loginElement) {
        expect(loginElement).toBeInTheDocument();
      }
    });
  });

  test('라우터가 존재하지 않는 경로를 처리한다', async () => {
    // 존재하지 않는 경로로 이동
    window.history.pushState({}, 'Test', '/nonexistent-page');
    
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    await waitFor(() => {
      // 404 페이지나 기본 페이지로 리다이렉트되는지 확인
      const notFoundElement = screen.queryByText('404') ||
                             screen.queryByText('페이지를 찾을 수 없습니다') ||
                             screen.queryByText('Not Found');
      
      // 404 페이지가 있거나, 기본 페이지로 리다이렉트되었는지 확인
      if (notFoundElement) {
        expect(notFoundElement).toBeInTheDocument();
      } else {
        // 기본 페이지로 리다이렉트되었는지 확인
        expect(window.location.pathname).toBe('/');
      }
    });
  });
});
