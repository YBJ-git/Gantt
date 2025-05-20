import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from '../../redux/store';
import App from '../../App';

const store = configureStore();

describe('페이지 간 연동 테스트', () => {
  test('메인 페이지에서 대시보드로 이동', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
    
    // 대시보드 링크 클릭
    const dashboardLink = screen.getByText('대시보드');
    fireEvent.click(dashboardLink);
    
    // 대시보드 페이지 렌더링 확인
    expect(screen.getByText('작업 부하 개요')).toBeInTheDocument();
  });

  test('대시보드에서 리소스 관리 페이지로 이동', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
    
    // 대시보드 링크 클릭
    const dashboardLink = screen.getByText('대시보드');
    fireEvent.click(dashboardLink);
    
    // 리소스 관리 링크 클릭
    const resourceManagementLink = screen.getByText('리소스 관리');
    fireEvent.click(resourceManagementLink);
    
    // 리소스 관리 페이지 렌더링 확인
    expect(screen.getByText('리소스 목록')).toBeInTheDocument();
  });

  test('리소스 관리에서 작업 관리 페이지로 이동', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
    
    // 리소스 관리 링크 클릭
    const resourceLink = screen.getByText('리소스 관리');
    fireEvent.click(resourceLink);
    
    // 작업 관리 링크 클릭
    const taskLink = screen.getByText('작업 관리');
    fireEvent.click(taskLink);
    
    // 작업 관리 페이지 렌더링 확인
    expect(screen.getByText('작업 목록')).toBeInTheDocument();
  });

  test('작업 관리에서 부하 최적화 도구 페이지로 이동', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
    
    // 작업 관리 링크 클릭
    const taskLink = screen.getByText('작업 관리');
    fireEvent.click(taskLink);
    
    // 부하 최적화 도구 링크 클릭
    const optimizationLink = screen.getByText('부하 최적화 도구');
    fireEvent.click(optimizationLink);
    
    // 부하 최적화 도구 페이지 렌더링 확인
    expect(screen.getByText('부하 최적화')).toBeInTheDocument();
  });
});
