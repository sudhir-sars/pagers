'use client';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { IoNotificationsOutline } from 'react-icons/io5';
import Link from 'next/link';

// You can replace this with a Badge component from shadcn UI if available.
const Badge = ({ count }: { count: number }) => (
  <span className="absolute top-0 right-0 rounded-full bg-red-500 text-white text-[10px] px-1">
    {count}
  </span>
);

const NotificationsDropdown = () => {
  // Replace this count with actual unread notifications data.
  const unreadCount = 5;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted">
          <IoNotificationsOutline size={24} />
          {unreadCount > 0 && <Badge count={unreadCount} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2">
        <DropdownMenuItem>
          <span className="text-sm text-muted-foreground">
            No new notifications
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="flex items-center space-x-2">
            <IoNotificationsOutline size={20} />
            <span>View all notifications</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
