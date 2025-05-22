import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, AuthContext } from '../../contexts/AuthContext';
import { RoleProvider } from '../../contexts/RoleContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import SessionWarningModal from '../../components/modals/SessionWarningModal';

// Test wrapper
const TestWrapper = ({ children, authValue = null }) => (
  <BrowserRouter>
    {authValue ? (
      <AuthContext.Provider value={authValue}>
        <RoleProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </RoleProvider>
      </AuthContext.Provider>
    ) : (
      <AuthProvider>
        <RoleProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </RoleProvider>
      </AuthProvider>
    )}
  </BrowserRouter>
);

describe('Component Unit Tests', () => {
  describe('ProtectedRoute Component', () => {
    test('인증된 사용자에게 컨텐츠 표시', () => {
      const mockAuthValue = {
        user: { id: 1, username: 'testuser', role: 'user' },
        isAuthenticated: true,
        loading: false
      };

      render(
        <TestWrapper authValue={mockAuthValue}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    test('미인증 사용자 리다이렉트', () => {
      const mockAuthValue = {
        user: null,
        isAuthenticated: false,
        loading: false
      };

      render(
        <TestWrapper authValue={mockAuthValue}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    test('권한 기반 접근 제어', () => {
      const mockAuthValue = {
        user: { id: 1, username: 'testuser', role: 'user' },
        isAuthenticated: true,
        loading: false
      };

      render(
        <TestWrapper authValue={mockAuthValue}>
          <ProtectedRoute requiredRoles={['admin']}>
            <div>Admin Only Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
    });

    test('로딩 상태 표시', () => {
      const mockAuthValue = {
        user: null,
        isAuthenticated: false,
        loading: true
      };

      render(
        <TestWrapper authValue={mockAuthValue}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText(/로딩/)).toBeInTheDocument();
    });
  });

  describe('SessionWarningModal Component', () => {
    const mockProps = {
      visible: true,
      timeLeft: 300, // 5분
      onExtendSession: jest.fn(),
      onLogout: jest.fn(),
      onClose: jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('모달이 올바르게 렌더링됨', () => {
      render(
        <TestWrapper>
          <SessionWarningModal {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByText('세션 만료 경고')).toBeInTheDocument();
      expect(screen.getByText(/5분 0초 후 자동으로 로그아웃/)).toBeInTheDocument();
    });

    test('시간 포맷이 올바르게 표시됨', () => {
      render(
        <TestWrapper>
          <SessionWarningModal {...mockProps} timeLeft={125} />
        </TestWrapper>
      );

      expect(screen.getByText(/2분 5초 후 자동으로 로그아웃/)).toBeInTheDocument();
    });

    test('세션 연장 버튼 동작', () => {
      render(
        <TestWrapper>
          <SessionWarningModal {...mockProps} />
        </TestWrapper>
      );

      const extendButton = screen.getByText('세션 연장');
      fireEvent.click(extendButton);

      expect(mockProps.onExtendSession).toHaveBeenCalledTimes(1);
    });

    test('로그아웃 버튼 동작', () => {
      render(
        <TestWrapper>
          <SessionWarningModal {...mockProps} />
        </TestWrapper>
      );

      const logoutButton = screen.getByText('로그아웃');
      fireEvent.click(logoutButton);

      expect(mockProps.onLogout).toHaveBeenCalledTimes(1);
    });

    test('모달이 숨겨져 있을 때 렌더링되지 않음', () => {
      render(
        <TestWrapper>
          <SessionWarningModal {...mockProps} visible={false} />
        </TestWrapper>
      );

      expect(screen.queryByText('세션 만료 경고')).not.toBeInTheDocument();
    });
  });
});

describe('Context Integration Tests', () => {
  describe('AuthContext Integration', () => {
    test('로그인 상태 변경 테스트', async () => {
      let authContextValue;
      
      const TestComponent = () => {
        authContextValue = React.useContext(AuthContext);
        return (
          <div>
            <div data-testid="auth-status">
              {authContextValue.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </div>
            <button onClick={() => authContextValue.login({ username: 'test', password: 'test' })}>
              Login
            </button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      await waitFor(() => {
        // 실제 API 호출 없이 상태 변경만 테스트
        expect(authContextValue.loading).toBe(false);
      });
    });
  });

  describe('NotificationContext Integration', () => {
    test('알림 추가 및 제거 테스트', async () => {
      let notificationContextValue;
      
      const TestComponent = () => {
        notificationContextValue = React.useContext(NotificationContext);
        return (
          <div>
            <div data-testid="notification-count">
              {notificationContextValue.notifications.length}
            </div>
            <button onClick={() => notificationContextValue.addNotification({
              id: '1',
              type: 'success',
              message: 'Test notification'
            })}>
              Add Notification
            </button>
            <button onClick={() => notificationContextValue.removeNotification('1')}>
              Remove Notification
            </button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('notification-count')).toHaveTextContent('0');

      const addButton = screen.getByText('Add Notification');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
      });

      const removeButton = screen.getByText('Remove Notification');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
      });
    });
  });
});

describe('Service Integration Tests', () => {
  describe('AuthService Integration', () => {
    test('토큰 저장 및 조회', () => {
      const authService = require('../../services/authService');
      
      const testToken = 'test-jwt-token';
      authService.setToken(testToken);
      
      expect(authService.getToken()).toBe(testToken);
      expect(localStorage.getItem('token')).toBe(testToken);
    });

    test('토큰 제거', () => {
      const authService = require('../../services/authService');
      
      authService.setToken('test-token');
      authService.removeToken();
      
      expect(authService.getToken()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('RoleService Integration', () => {
    test('권한 체크 함수', () => {
      const roleService = require('../../services/roleService');
      
      expect(roleService.hasPermission('admin', 'user')).toBe(true);
      expect(roleService.hasPermission('user', 'admin')).toBe(false);
      expect(roleService.hasPermission('manager', 'worker')).toBe(true);
    });

    test('다중 권한 체크', () => {
      const roleService = require('../../services/roleService');
      
      expect(roleService.hasAnyPermission('user', ['admin', 'manager'])).toBe(false);
      expect(roleService.hasAnyPermission('admin', ['admin', 'manager'])).toBe(true);
      expect(roleService.hasAnyPermission('manager', ['admin', 'manager'])).toBe(true);
    });
  });
});

describe('Performance Tests', () => {
  test('컴포넌트 렌더링 성능', async () => {
    const start = performance.now();
    
    render(
      <TestWrapper>
        <div>Performance Test Component</div>
      </TestWrapper>
    );
    
    const end = performance.now();
    const renderTime = end - start;
    
    // 렌더링이 100ms 이내에 완료되어야 함
    expect(renderTime).toBeLessThan(100);
  });

  test('대량 데이터 렌더링 성능', () => {
    const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random()
    }));

    const start = performance.now();
    
    const TestComponent = () => (
      <div>
        {largeDataSet.map(item => (
          <div key={item.id}>{item.name}: {item.value}</div>
        ))}
      </div>
    );

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    const end = performance.now();
    const renderTime = end - start;
    
    // 대량 데이터 렌더링이 500ms 이내에 완료되어야 함
    expect(renderTime).toBeLessThan(500);
  });
});
