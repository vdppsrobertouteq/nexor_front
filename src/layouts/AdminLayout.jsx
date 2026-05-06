// File: frontend/src/layouts/AdminLayout/AdminLayout.jsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import Navbar from '../components/Navbars/Navbar';
import AdminSidebar from '../components/Sidebars/AdminSidebar';
import './Layout.css';

const { Content } = Layout;

const AdminLayout = ({ children }) => {
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
        <AdminSidebar
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

export default AdminLayout;