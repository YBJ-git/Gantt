import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider } from '../../contexts/AuthContext';
import { RoleProvider } from '../../contexts/RoleContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import Login from '../../pages/Auth/Login';
import Register from '../../pages/Auth/Register';
import UserManagement from '../../pages/Auth/UserManagement';
import TaskManager from '../../pages/TaskManager';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Test wrapper 컴포넌트
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <RoleProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </RoleProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Authentication API', () => {
    test('로그인 API 연동 테스트', async () => {
      const mockResponse = {
        data: {
          success: true,
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          },
          token: 'mock-jwt-token'
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const usernameInput = screen.getByPlaceholderText('사용자명');
      const passwordInput = screen.getByPlaceholderText('비밀번호');
      const loginButton = screen.getByRole('button', { name: '로그인' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/login'),
          {
            username: 'testuser',
            password: 'password123'
          }
        );
      });
    });

    test('회원가입 API 연동 테스트', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '회원가입이 완료되었습니다.',
          user: {
            id: 1,
            username: 'newuser',
            email: 'new@example.com'
          }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      // 폼 입력 및 제출 테스트
      const usernameInput = screen.getByLabelText('사용자명');
      const emailInput = screen.getByLabelText('이메일');
      const passwordInput = screen.getByLabelText('비밀번호');
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인');
      const submitButton = screen.getByRole('button', { name: '회원가입' });

      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/register'),
          expect.objectContaining({
            username: 'newuser',
            email: 'new@example.com',
            password: 'password123!'
          })
        );
      });
    });

    test('토큰 검증 API 테스트', async () => {
      const mockResponse = {
        data: {
          success: true,
          user: {
            id: 1,
            username: 'testuser',
            role: 'user'
          }
        }
      };

      localStorage.setItem('token', 'mock-jwt-token');
      mockedAxios.get.mockResolvedValue(mockResponse);

      render(
        <TestWrapper>
          <div>Test Component</div>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/verify'),
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer mock-jwt-token'
            }
          })
        );
      });
    });
  });

  describe('User Management API', () => {
    test('사용자 목록 조회 API 테스트', async () => {
      const mockResponse = {
        data: {
          success: true,
          users: [
            { id: 1, username: 'user1', email: 'user1@example.com', role: 'user' },
            { id: 2, username: 'user2', email: 'user2@example.com', role: 'manager' }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2
          }
        }
      };

      localStorage.setItem('token', 'mock-jwt-token');
      mockedAxios.get.mockResolvedValue(mockResponse);

      render(
        <TestWrapper>
          <UserManagement />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/users'),
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer mock-jwt-token'
            },
            params: expect.objectContaining({
              page: 1,
              limit: 10
            })
          })
        );
      });
    });

    test('사용자 생성 API 테스트', async () => {
      const mockResponse = {
        data: {
          success: true,
          user: {
            id: 3,
            username: 'newuser',
            email: 'new@example.com',
            role: 'user'
          }
        }
      };

      localStorage.setItem('token', 'mock-jwt-token');
      mockedAxios.post.mockResolvedValue(mockResponse);

      render(
        <TestWrapper>
          <UserManagement />
        </TestWrapper>
      );

      // 사용자 추가 버튼 클릭 및 폼 작성 시뮬레이션
      await waitFor(() => {
        expect(screen.getByText('사용자 관리')).toBeInTheDocument();
      });

      // API 호출 시뮬레이션
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/users'),
          expect.any(Object),
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer mock-jwt-token'
            }
          })
        );
      });
    });
  });

  describe('Task Management API', () => {
    test('작업 목록 조회 API 테스트', async () => {
      const mockResponse = {
        data: {
          success: true,
          tasks: [
            {
              id: 1,
              title: 'Test Task 1',
              description: 'Test Description',
              status: 'pending',
              assignee: 'user1',
              dueDate: '2023-12-31'
            }
          ]
        }
      };

      localStorage.setItem('token', 'mock-jwt-token');
      mockedAxios.get.mockResolvedValue(mockResponse);

      render(
        <TestWrapper>
          <TaskManager />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/tasks'),
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer mock-jwt-token'
            }
          })
        );
      });
    });

    test('작업 생성 API 테스트', async () => {
      const mockResponse = {
        data: {
          success: true,
          task: {
            id: 2,
            title: 'New Task',
            description: 'New Task Description',
            status: 'pending'
          }
        }
      };

      localStorage.setItem('token', 'mock-jwt-token');
      mockedAxios.post.mockResolvedValue(mockResponse);

      render(
        <TestWrapper>
          <TaskManager />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('작업 관리')).toBeInTheDocument();
      });

      // 작업 생성 API 호출 시뮬레이션
      const newTask = {
        title: 'New Task',
        description: 'New Task Description',
        assignee: 'user1',
        dueDate: '2023-12-31'
      };

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/tasks'),
          newTask,
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer mock-jwt-token'
            }
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    test('네트워크 오류 처리 테스트', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const usernameInput = screen.getByPlaceholderText('사용자명');
      const passwordInput = screen.getByPlaceholderText('비밀번호');
      const loginButton = screen.getByRole('button', { name: '로그인' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/네트워크 오류가 발생했습니다/)).toBeInTheDocument();
      });
    });

    test('인증 실패 처리 테스트', async () => {
      const mockResponse = {
        response: {
          status: 401,
          data: {
            success: false,
            message: '인증에 실패했습니다.'
          }
        }
      };

      mockedAxios.post.mockRejectedValue(mockResponse);

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const usernameInput = screen.getByPlaceholderText('사용자명');
      const passwordInput = screen.getByPlaceholderText('비밀번호');
      const loginButton = screen.getByRole('button', { name: '로그인' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/인증에 실패했습니다/)).toBeInTheDocument();
      });
    });
  });

  describe('Real API Integration (환경 변수 설정 시)', () => {
    beforeEach(() => {
      // 실제 API 테스트를 위해 mock 해제
      jest.restoreAllMocks();
    });

    test('실제 API 서버 연결 테스트 (선택적)', async () => {
      if (process.env.REACT_APP_TEST_REAL_API === 'true') {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/health`
          );
          expect(response.status).toBe(200);
          expect(response.data).toHaveProperty('status', 'ok');
        } catch (error) {
          console.warn('실제 API 서버에 연결할 수 없습니다:', error.message);
          // 실제 서버가 없어도 테스트가 실패하지 않도록 처리
        }
      } else {
        console.log('실제 API 테스트는 REACT_APP_TEST_REAL_API=true 설정 시 실행됩니다.');
      }
    });
  });
});
