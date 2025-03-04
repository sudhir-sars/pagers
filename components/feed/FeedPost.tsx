// app/components/feed/FeedPost.tsx
'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FiMessageSquare } from 'react-icons/fi';
import { IPost, IUser } from '@/lib/types';
import PostActions from './PostActions';
import Image from 'next/image';

interface FeedPostProps {
  post: IPost;
  onMessageTarget: (target: IUser) => void;
}

const FeedPost: React.FC<FeedPostProps> = ({ post, onMessageTarget }) => {
  const { id, author, brief, extendedDescription, media, poll } = post;
  const [isFollowing, setIsFollowing] = useState(false);

  const getToken = () => localStorage.getItem('JWT_token');

  // Follow/unfollow logic remains unchanged
  const handleFollowToggle = async () => {
    const token = getToken();
    if (!token) return;
    if (!isFollowing) {
      try {
        const res = await fetch('/api/follow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipientId: author.id }),
        });
        if (!res.ok) throw new Error('Failed to follow user');
        setIsFollowing(true);
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        const res = await fetch(`/api/unfollow?recipientId=${author.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to unfollow user');
        setIsFollowing(false);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Instead of sending a message here, trigger the callback with the author as target.
  const handleOpenMessages = () => {
    onMessageTarget(author);
  };

  return (
    <div className="mb-4">
      <Card className="mb-2">
        <CardHeader>
          <div className="flex items-center justify-between">
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
            <div className="flex items-center">
              <button
                className="hover:text-blue-600"
                onClick={handleOpenMessages}
              >
                <FiMessageSquare size={20} />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">{extendedDescription || brief}</p>
          {media && media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {media.map((item) => (
                <div key={item.id}>
                  {item.type === 'IMAGE' ? (
                    <Image
                      height={300}
                      width={300}
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
          <PostActions post={post} />
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedPost;
