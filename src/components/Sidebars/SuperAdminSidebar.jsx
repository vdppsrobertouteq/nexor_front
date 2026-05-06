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
  RightOutlined,
  NotificationFilled,
  FolderFilled
} from '@ant-design/icons';
import useAuth from '../../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const { Sider } = Layout;
const { Text } = Typography;

const SuperAdminSidebar = ({
  isOpen,
  onClose,
  selectedKey = '1',
  onMenuClick,
  userName = "Usuario",
  userRole = "Administrador",
  userAvatar = null
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const { role } = useAuth;
  const navigate = useNavigate();

  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/dashboard/superadmin'
    },
    {
      key: '2',
      icon: <UserOutlined />,
      label: 'Usuarios',
      path: '/dashboard/superadmin/usuarios'
    },
    {
      key: '3',
      icon: <FolderFilled />,
      label: 'Portafolios',
      path: '/dashboard/superadmin/portfolios'
    }
  ];

  const handleMenuClick = (item) => {
    if (item.key) {
      const clickedMenuItem = menuItems.find(menuItem => menuItem.key === item.key);
      if (clickedMenuItem && clickedMenuItem.path) {
        navigate(clickedMenuItem.path);
        onClose();
      }
    }
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
                <Text className="sidebar-user-name">{user?.nombre}</Text>
                <Text className="sidebar-user-role">{user?.nombre_rol}</Text>
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

export default SuperAdminSidebar;