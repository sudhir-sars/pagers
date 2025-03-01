'use client';
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { IoEllipsisHorizontalOutline } from 'react-icons/io5';
import Link from 'next/link';

const MoreDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded-full hover:bg-muted">
          <IoEllipsisHorizontalOutline size={24} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 p-2">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center space-x-2">
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center space-x-2">
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/logout" className="flex items-center space-x-2">
            <span>Logout</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoreDropdown;
