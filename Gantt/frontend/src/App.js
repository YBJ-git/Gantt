import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider, Layout } from 'antd';
import store from './redux/store';
import './App.css';

// 페이지 컴포넌트 임포트
import TestPage from './pages/TestPage';
import Dashboard from './pages/Dashboard';
import ReportsAnalysis from './pages/ReportsAnalysis';
import ResourceManagement from './pages/ResourceManagement';
import TaskManagement from './pages/TaskManagement';
import Collaboration from './pages/Collaboration';
import OptimizationTools from './pages/OptimizationTools';

// 레이아웃 컴포넌트 임포트
import MainHeader from './components/layout/MainHeader';
import MainSidebar from './components/layout/MainSidebar';
import NotificationProvider from './contexts/NotificationContext';

const { Content } = Layout;

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 4,
          },
        }}
      >
        <NotificationProvider>
          <Router>
            <Layout className="app-container">
              <MainHeader />
              <Layout>
                <MainSidebar />
                <Content className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/reports" element={<ReportsAnalysis />} />
                    <Route path="/resources" element={<ResourceManagement />} />
                    <Route path="/tasks" element={<TaskManagement />} />
                    <Route path="/collaboration" element={<Collaboration />} />
                    <Route path="/optimization" element={<OptimizationTools />} />
                    <Route path="/test" element={<TestPage />} />
                  </Routes>
                </Content>
              </Layout>
            </Layout>
          </Router>
        </NotificationProvider>
      </ConfigProvider>
    </Provider>
  );
}

export default App;