'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaGraduationCap, FaMapMarkerAlt, FaGithub } from 'react-icons/fa';
import { SiCodeforces } from 'react-icons/si';
import { Separator } from '@/components/ui/separator';
import TagButton from '@/components/Button/TagButton';

const ProfileSidebar = () => {
  return (
    <aside className="w-[300px] fixed left-[calc((100vw-76vw)/2)] top-[6.5rem] ">
      <Card className="p-4">
        <CardContent className="mt-4">
          {/* Header: Avatar and Basic Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/path/to/profile.jpg" alt="Profile image" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">John Doe</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Lovely Professional University
              </p>
            </div>
          </div>
          {/* Additional Information */}
          <div className="mt-4 space-y-3">
            <p className="mt-2 text-sm">
              A passionate student exploring the realms of technology and
              innovation.
            </p>
            <Separator className="h-[1px]" />
            <div className="space-y-2 text-xs">
              <div className="flex items-center">
                <FaGraduationCap size={17} className="mr-3 text-gray-500" />
                Computer Science
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt size={17} className="mr-3 text-gray-500" />
                New York, NY
              </div>
              <div className="flex items-center">
                <FaGithub size={17} className="mr-3 text-gray-500" />
                <a
                  href="https://github.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  GitHub Profile
                </a>
              </div>
              <div className="flex items-center">
                <SiCodeforces size={15} className="mr-3 text-gray-500" />
                <a
                  href="https://codeforces.com/profile/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Codeforces Profile
                </a>
              </div>
            </div>
            <Separator className="h-[1px] rounded-full" />
            <div className="flex flex-wrap gap-2">
              <TagButton color="blue" text="Web Development" />
              <TagButton color="green" text="AI" />
              <TagButton color="yellow" text="Open Source" />
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
};

export default ProfileSidebar;
