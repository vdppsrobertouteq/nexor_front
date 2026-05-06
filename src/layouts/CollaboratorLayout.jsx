// File: frontend/src/layouts/CollaboratorLayout/CollaboratorLayout.jsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import Navbar from '../components/Navbars/Navbar';
import CollaboratorSidebar from '../components/Sidebars/CollaboratorSidebar';
import './Layout.css';

const { Content } = Layout;

const CollaboratorLayout = ({ children }) => {
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
        <CollaboratorSidebar
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

export default CollaboratorLayout;