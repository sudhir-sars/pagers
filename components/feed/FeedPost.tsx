'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FiMessageSquare } from 'react-icons/fi';
import { IPost } from '@/lib/types';
import PostActions from './PostActions'; // Adjust the path as needed
import Image from 'next/image';
interface FeedPostProps {
  post: IPost;
}

const FeedPost: React.FC<FeedPostProps> = ({ post }) => {
  const { id, author, brief, extendedDescription, media, poll } = post;
  const [isFollowing, setIsFollowing] = useState(false);
  const handleFollowToggle = () => setIsFollowing((prev) => !prev);

  return (
    <div className="mb-4">
      <Card className="mb-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            {/* Left side: Avatar, Name, and Follow Button */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={author.image} alt="User Profile" />
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <h3 className="text-md font-semibold">{author.name}</h3>
                  <button
                    onClick={handleFollowToggle}
                    className="px-2 py-[0.15rem] text-xs border border-blue-500 text-blue-500 rounded-2xl hover:bg-blue-50"
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{author.title}</p>
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
          {/* Post text content */}
          <p className="text-sm mb-4">{extendedDescription || brief}</p>
          {/* Media Section */}
          {media && media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {media.map((item) => (
                <div key={item.id}>
                  {item.type === 'IMAGE' ? (
                    <Image
                      height={300}
                      width={300}
                      // width={auto}
                      src={item.url}
                      alt={item.altText || 'Media'}
                      className="object-cover w-full h-48 rounded-md"
                    />
                  ) : item.type === 'VIDEO' ? (
                    <video
                      src={item.url}
                      controls
                      className="object-cover w-full h-48 rounded-md"
                    />
                  ) : (
                    <div>{item.type}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Poll Section */}
          {poll && (
            <div className="border p-4 rounded-md mb-4">
              <h4 className="font-semibold mb-2">{poll.question}</h4>
              <ul className="space-y-1">
                {poll.options.map((option, index) => (
                  <li
                    key={index}
                    className="px-2 py-1 border rounded-md hover:bg-gray-100"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Post Actions & Comments */}
          <PostActions post={post} />
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedPost;
