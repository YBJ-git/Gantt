import React from 'react';
import { Layout as AntLayout } from 'antd';
import MainHeader from './MainHeader';
import MainSidebar from './MainSidebar';

const { Content } = AntLayout;

const Layout = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <MainSidebar />
      <AntLayout>
        <MainHeader />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
