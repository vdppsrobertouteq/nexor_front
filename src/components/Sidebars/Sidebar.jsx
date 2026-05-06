import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Divider } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TeamOutlined,
  CloseOutlined,
  RightOutlined
} from '@ant-design/icons';
import './Sidebar.css';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = ({ 
  isOpen, 
  onClose, 
  selectedKey = '1',
  onMenuClick,
  userName = "Usuario",
  userRole = "Administrador",
  userAvatar = null
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      key: '2',
      icon: <UserOutlined />,
      label: 'Usuarios',
      path: '/users'
    },
    {
      key: '3',
      icon: <FileTextOutlined />,
      label: 'Documentos',
      path: '/documents'
    },
    {
      key: '4',
      icon: <BarChartOutlined />,
      label: 'Reportes',
      path: '/reports'
    },
    {
      key: '5',
      icon: <TeamOutlined />,
      label: 'Equipos',
      path: '/teams'
    },
    {
      key: '6',
      icon: <SettingOutlined />,
      label: 'Configuración',
      path: '/settings'
    }
  ];

  const handleMenuClick = (item) => {
    if (onMenuClick) {
      onMenuClick(item);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`custom-sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-container">
          {/* Header */}
          <div className="sidebar-header">
            <Button
              type="text"
              className="sidebar-close-btn"
              icon={<CloseOutlined />}
              onClick={onClose}
              size="small"
            />
            
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <div className="sidebar-logo-inner"></div>
              </div>
              <Text className="sidebar-brand-name">Dashboard</Text>
            </div>
          </div>

          {/* User Section */}
          <div className="sidebar-user-section">
            <div className="sidebar-user-info">
              <Avatar 
                size={48} 
                src={userAvatar} 
                icon={<UserOutlined />}
                className="sidebar-user-avatar"
              />
              <div className="sidebar-user-details">
                <Text className="sidebar-user-name">{userName}</Text>
                <Text className="sidebar-user-role">{userRole}</Text>
              </div>
            </div>
            <div className="sidebar-user-status">
              <div className="status-indicator active"></div>
              <Text className="status-text">En línea</Text>
            </div>
          </div>

          <Divider className="sidebar-divider" />

          {/* Navigation Menu */}
          <div className="sidebar-menu-container">
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              className="sidebar-menu"
              inlineCollapsed={collapsed}
            >
              {menuItems.map((item) => (
                <Menu.Item
                  key={item.key}
                  icon={item.icon}
                  className="sidebar-menu-item"
                  onClick={() => handleMenuClick(item)}
                >
                  <span className="menu-item-text">{item.label}</span>
                  <RightOutlined className="menu-item-arrow" />
                </Menu.Item>
              ))}
            </Menu>
          </div>

          {/* Footer */}
          <div className="sidebar-footer">
            <div className="sidebar-footer-content">
              <Text className="sidebar-footer-text">
                © 2024 Dashboard
              </Text>
              <Text className="sidebar-version">
                v1.0.0
              </Text>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;