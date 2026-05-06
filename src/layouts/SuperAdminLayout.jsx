// File: frontend/src/layouts/SuperAdminLayout/SuperAdminLayout.jsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import Navbar from '../components/Navbars/Navbar';
import SuperAdminSidebar from '../components/Sidebars/SuperAdminSidebar';
import './Layout.css';

const { Content } = Layout;

const SuperAdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Layout className="app-layout">
      <Navbar onMenuToggle={handleToggleSidebar} />
      
      <Layout className="main-content-area">
        <SuperAdminSidebar
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
        />
        
        <Content className="page-content">
          <div className="content-wrapper">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SuperAdminLayout;