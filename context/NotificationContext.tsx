'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from './WebSocketContext';

import { INotification } from '@/lib/types';

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  setUnreadCount: (unreadCount: number) => void;
  setNotifications: (notifications: INotification[]) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  setUnreadCount: () => {},
  setNotifications: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { socket } = useWebSocket();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getToken = () => localStorage.getItem('JWT_token');

  const fetchNotifications = async () => {
    const token = getToken();
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error('Error fetching notifications');
      }
      const data = await res.json();

      setNotifications(data);
      setUnreadCount(data.filter((n: INotification) => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: INotification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (!notification.isRead) setUnreadCount((prev) => prev + 1);
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, setNotifications, setUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
