'use client';
import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IoNotificationsOutline } from 'react-icons/io5';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNotifications } from '@/context/NotificationContext';

const NotificationsFeed: React.FC = () => {
  const { notifications, setUnreadCount, setNotifications } =
    useNotifications();

  const markNotificationsAsRead = async (notificationIds: string[]) => {
    if (notificationIds.length === 0) return; // Avoid unnecessary API calls

    const token = localStorage.getItem('JWT_token');
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!res.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      console.log('Notifications marked as read');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAllAsRead = () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    if (unreadNotifications.length === 0) return;

    const unreadIds = unreadNotifications.map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    markNotificationsAsRead(unreadIds);
  };

  useEffect(() => {
    markAllAsRead(); // Automatically mark notifications as read when viewed
  }, []);

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2 mb-4">
        <IoNotificationsOutline size={24} />
        <h3 className="text-lg font-semibold">Notifications</h3>
        {/* <button
          onClick={markAllAsRead}
          className="ml-auto text-sm text-blue-500 hover:underline"
        >
          Mark all as read
        </button> */}
      </div>

      <ScrollArea className="h-[75vh] p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-4">No notifications</div>
        ) : (
          <div className="flex flex-col space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="border-b">
                <button className="w-full text-left px-4 py-2 rounded-xl transition-colors hover:bg-accent hover:text-accent-foreground flex items-center space-x-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={notification.avatar} alt="User avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-base font-medium">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationsFeed;
