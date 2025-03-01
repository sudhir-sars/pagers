'use client';
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Compass, Folder, Star, User, Settings } from 'lucide-react';

interface ProfileSidebarProps {
  onFeedTypeChange: (
    feedType: 'home' | 'following' | 'projects' | 'editors-choice'
  ) => void;
  onViewChange: (view: 'profile' | 'settings') => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  onFeedTypeChange,
  onViewChange,
}) => {
  return (
    <aside className="w-[300px] fixed left-[calc((100vw-76vw)/2)] top-[6.5rem] bottom-10 z-50 flex flex-col">
      <nav className="flex flex-col space-y-2 items-start border-r">
        <div
          onClick={() => onFeedTypeChange('home')}
          className="flex items-center hover:bg-accent hover:text-accent-foreground rounded-full px-3 py-3 pl-5 pr-14 cursor-pointer"
        >
          <Home size={28} className="mr-3" />
          <span className="text-lg font-medium">Home</span>
        </div>

        <div
          onClick={() => onFeedTypeChange('following')}
          className="flex items-center hover:bg-accent hover:text-accent-foreground rounded-full px-3 py-3 pl-5 pr-14 cursor-pointer"
        >
          <Compass size={28} className="mr-3" />
          <span className="text-lg font-medium">Following</span>
        </div>
        <div
          onClick={() => onFeedTypeChange('projects')}
          className="flex items-center hover:bg-accent hover:text-accent-foreground rounded-full px-3 py-3 pl-5 pr-14 cursor-pointer"
        >
          <Folder size={28} className="mr-3" />
          <span className="text-lg font-medium">Projects</span>
        </div>
        <div
          onClick={() => onFeedTypeChange('editors-choice')}
          className="flex items-center hover:bg-accent hover:text-accent-foreground rounded-full px-3 py-3 pl-5 pr-14 cursor-pointer"
        >
          <Star size={28} className="mr-3" />
          <span className="text-lg font-medium">Editors Choice</span>
        </div>
        <div
          onClick={() => onViewChange('profile')}
          className="flex items-center hover:bg-accent hover:text-accent-foreground rounded-full px-3 py-3 pl-5 pr-14 cursor-pointer"
        >
          <User size={28} className="mr-3" />
          <span className="text-lg font-medium">Profile</span>
        </div>
        <div
          onClick={() => onViewChange('settings')}
          className="flex items-center hover:bg-accent hover:text-accent-foreground rounded-full px-3 py-3 pl-5 pr-14 cursor-pointer"
        >
          <Settings size={28} className="mr-3" />
          <span className="text-lg font-medium">Settings</span>
        </div>
      </nav>
      <div className="mt-auto pt-4">
        <Card className="p-3">
          <CardContent className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/path/to/profile.jpg" alt="Profile image" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-gray-500">@johndoe</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
