'use client';
import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IoNotificationsOutline } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Notification {
  id: string;
  message: string;
  createdAt: string;
  type: string;
  avatar: string;
}

const NotificationsFeed: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getLocalStorageItem = (key: string) =>
    typeof window !== 'undefined' ? localStorage.getItem(key) : null;

  const getToken = () => getLocalStorageItem('JWT_token');

  const fetchNotifications = async () => {
    setLoading(true);
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
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2 mb-4">
        <IoNotificationsOutline size={24} />
        <h3 className="text-lg font-semibold">Notifications</h3>
      </div>

      <ScrollArea className="h-[75vh] p-4">
        {loading ? (
          <div className="text-center py-4">Loading notifications...</div>
        ) : notifications.length === 0 ? (
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
