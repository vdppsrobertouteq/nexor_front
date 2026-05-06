// File: frontend/src/components/Notifications/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { Dropdown, Button, List, Typography, Spin, Empty, Badge, Tooltip } from 'antd';
import {
  BellOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import './Notifications.css';
import notificationService from '../../services/notificationService';

const { Text } = Typography;

const Notifications = ({ trigger, placement = 'bottomRight', onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications and unread count when dropdown opens
  useEffect(() => {
    if (open) {
      loadNotifications();
      loadUnreadCount();
    }
    // eslint-disable-next-line
  }, [open]);

  // Polling automático del contador de notificaciones no leídas cada 60 segundos
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  // Helper for fetching notifications
  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend returns { success, message, data }
      const res = await notificationService.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  // Helper for fetching unread count
  const loadUnreadCount = async () => {
    try {
      // Backend returns { success, message, data: { count } }
      const res = await notificationService.getUnreadCount();
      const count = res.data?.count || 0;
      setUnreadCount(count);
      if (onUnreadCountChange) {
        onUnreadCountChange(count);
      }
    } catch (err) {
      // Silent fail
    }
  };

  // Mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update notification locally
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, leida: true } : n
        )
      );
      loadUnreadCount();
    } catch {
      // Optionally show error
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, leida: true }))
      );
      loadUnreadCount();
    } catch {
      // Optionally show error
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  };

  // Icon for type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <NotificationOutlined className="notification-icon info" />;
      case 'success':
        return <CheckCircleOutlined className="notification-icon success" />;
      case 'warning':
        return <ClockCircleOutlined className="notification-icon warning" />;
      default:
        return <BellOutlined className="notification-icon default" />;
    }
  };

  const dropdownContent = (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <div className="notifications-title">
          <BellOutlined className="header-icon" />
          <Text strong>Notificaciones</Text>
          {unreadCount > 0 && (
            <Badge count={unreadCount} size="small" className="header-badge" />
          )}
        </div>
        {notifications.length > 0 && (
          <Button
            type="text"
            size="small"
            onClick={handleMarkAllAsRead}
            className="mark-all-btn"
            disabled={unreadCount === 0}
          >
            Marcar todas como leídas
          </Button>
        )}
      </div>
      <div className="notifications-content">
        {loading ? (
          <div className="notifications-loading">
            <Spin size="large" />
            <Text className="loading-text">Cargando notificaciones...</Text>
          </div>
        ) : error ? (
          <div className="notifications-error">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={error}
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No tienes notificaciones"
            />
          </div>
        ) : (
          <List
            className="notifications-list"
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                className={`notification-item ${!notification.leida ? 'unread' : ''}`}
                key={notification.id}
              >
                <div className="notification-content">
                  <div className="notification-main">
                    <div className="notification-avatar">
                      {getNotificationIcon(notification.tipo_notificacion)}
                    </div>
                    <div className="notification-body">
                      <Text className="notification-message">
                        {notification.mensaje}
                      </Text>
                      <Text className="notification-date">
                        {formatDate(notification.fecha_creacion)}
                      </Text>
                    </div>
                    {!notification.leida && (
                      <Tooltip title="Marcar como leída">
                        <Button
                          type="text"
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="mark-read-btn"
                        />
                      </Tooltip>
                    )}
                  </div>
                  {!notification.leida && (
                    <div className="notification-indicator" />
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
      {notifications.length > 5 && (
        <div className="notifications-footer">
          <Button type="text" size="small" className="view-all-btn">
            Ver todas las notificaciones
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={dropdownContent}
      trigger={['click']}
      placement={placement}
      open={open}
      onOpenChange={setOpen}
      overlayClassName="notifications-dropdown-overlay"
    >
      {trigger}
    </Dropdown>
  );
};

export default Notifications;