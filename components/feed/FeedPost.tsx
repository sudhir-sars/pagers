'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  IoThumbsUpOutline,
  IoChatbubbleOutline,
  IoBookmarkOutline,
} from 'react-icons/io5';
import { FiMessageSquare } from 'react-icons/fi';

interface FeedPostProps {
  id: number;
  authorName: string;
  authorAvatar: string;
  authorTitle: string;
  content: string;
}

const FeedPost: React.FC<FeedPostProps> = ({
  authorName,
  authorAvatar,
  authorTitle,
  content,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const handleFollowToggle = () => setIsFollowing(!isFollowing);

  return (
    <div>
      <Card className="mb-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            {/* Left side: Avatar, Name, and Follow Button */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={authorAvatar} alt="User Profile" />
                <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h3 className="text-md font-semibold">{authorName}</h3>
                  <button
                    onClick={handleFollowToggle}
                    className="px-2 py-[0.15rem] text-xs border border-blue-500 text-blue-500 rounded-2xl hover:bg-blue-50"
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{authorTitle}</p>
              </div>
            </div>
            {/* Right side: Messaging Icon */}
            <div className="flex items-center">
              <button className="hover:text-blue-600">
                <FiMessageSquare size={20} />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{content}</p>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between mt-2 px-4">
        <div className="flex items-center space-x-4">
          <Button size="sm" variant="outline" className="pr-4">
            <IoThumbsUpOutline />
            Like
          </Button>
          <Button size="sm" variant="outline" className="pr-4">
            <IoChatbubbleOutline />
            Comment
          </Button>
        </div>
        <Button size="sm" variant="outline" className="pr-4">
          <IoBookmarkOutline />
          Save
        </Button>
      </div>
    </div>
  );
};

export default FeedPost;
