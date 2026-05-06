// File: frontend/src/components/Navbars/Navbar.jsx
import React, { useState } from 'react';
import { Layout, Button, Avatar, Badge, Tooltip, Typography } from 'antd';
import {
  MenuOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuth from '../../contexts/useAuth';
import Notifications from '../Notifications/Notifications';
import './Navbar.css';
import logo from '../../assets/logo.png';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = ({
  onMenuToggle,
  userName = 'Usuario',
  userAvatar = null,
  onProfileClick
}) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
      }
    });
  };

  const handleUnreadCountChange = (count) => {
    setNotificationCount(count);
  };

  const notificationTrigger = (
    <Tooltip title="Notificaciones">
      <Badge count={notificationCount} size="small">
        <Button
          type="text"
          className="navbar-action-btn"
          icon={<BellOutlined />}
          size="large"
        />
      </Badge>
    </Tooltip>
  );

  return (
    <Header className="custom-navbar">
      <div className="navbar-container">
        {/* Left Section */}
        <div className="navbar-left">
          <Button
            type="text"
            className="menu-toggle-btn"
            icon={<MenuOutlined />}
            onClick={onMenuToggle}
            size="large"
          />

          <div className="logo-section">
            <img src={logo} alt="Logo" className="logo-img" />
            <Text className="brand-name">Dashboard</Text>
          </div>

          <div className="user-info">
            <Avatar
              size="small"
              src={userAvatar}
              icon={<UserOutlined />}
              className="user-avatar"
            />
            <Text className="user-name">{user?.nombre} {user?.apellido}</Text>
          </div>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          <Notifications
            trigger={notificationTrigger}
            placement="bottomRight"
            onUnreadCountChange={handleUnreadCountChange}
          />

          <Tooltip title="Cerrar Sesión">
            <Button
              type="text"
              className="navbar-action-btn logout-btn"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              size="large"
            />
          </Tooltip>
        </div>
      </div>
    </Header>
  );
};

export default Navbar;