'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import PostActions from './PostActions';
import { IPost } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface FeedPostProps {
  post: IPost;
  followedUserIds?: string[];
  updateFollowList?: (userId: string, isFollowing: boolean) => void;
  likedPostIds?: number[];
  shareUsers?: { id: string; name: string; image: string }[];
}

const FeedPost: React.FC<FeedPostProps> = ({
  post,
  followedUserIds = [],
  updateFollowList = () => {},
  likedPostIds = [],
  shareUsers,
}) => {
  const { id, author, brief, extendedDescription, media, poll, project } = post;
  const [isFollowing, setIsFollowing] = useState<boolean>(
    followedUserIds.includes(author.id)
  );
  const router = useRouter();

  useEffect(() => {
    setIsFollowing(followedUserIds.includes(author.id));
  }, [followedUserIds, author.id]);

  // Utility function to retrieve token from localStorage
  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('JWT_token') : null;

  // Authorized helper: If token exists, execute callback; otherwise, redirect to /login.
  const authorized = (callback: (token: string) => void) => {
    const token = getToken();
    if (token) {
      callback(token);
    } else {
      router.push('/login');
    }
  };

  // Toggle follow/unfollow with authorized check
  const handleFollowToggle = async () => {
    authorized(async (token) => {
      if (!isFollowing) {
        try {
          const res = await fetch('/api/profile/follow', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ recipientId: author.id }),
          });
          if (!res.ok) throw new Error('Failed to follow user');
          setIsFollowing(true);
          updateFollowList(author.id, true);
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          const res = await fetch(
            `/api/profile/unfollow?recipientId=${author.id}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!res.ok) throw new Error('Failed to unfollow user');
          setIsFollowing(false);
          updateFollowList(author.id, false);
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  // Determine initial liked state based on fetched likedPostIds
  const initialLiked = likedPostIds.includes(post.id);

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
                <p className="text-sm text-muted-foreground">@{author.title}</p>
              </div>
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

          {/* Render inner project card if the post has an associated project */}
          {project && (
            <Card className="mb-4 border shadow-sm">
              <CardHeader>
                <h3 className="text-md font-semibold">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.brief}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{project.description}</p>
                {project.media && project.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {project.media.map((mediaItem: any) => (
                      <div key={mediaItem.id}>
                        {mediaItem.type === 'IMAGE' ? (
                          <Image
                            height={300}
                            width={300}
                            src={mediaItem.url}
                            alt={mediaItem.altText || 'Project Media'}
                            className="object-cover w-full h-48 rounded-md"
                          />
                        ) : mediaItem.type === 'VIDEO' ? (
                          <video
                            src={mediaItem.url}
                            controls
                            className="object-cover w-full h-48 rounded-md"
                          />
                        ) : (
                          <div>{mediaItem.type}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <PostActions
            post={post}
            initialLiked={initialLiked}
            shareUsers={shareUsers}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedPost;
