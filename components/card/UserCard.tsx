'use client';
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { IUserProfile } from '@/lib/types';

interface UserCardProps {
  user: IUserProfile; // Use full IUser type assuming API returns it
  initialIsFollowing: boolean;
  updateFollowList: (userId: string, isFollowing: boolean) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  initialIsFollowing,
  updateFollowList,
}) => {
  console.log(user);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const router = useRouter();

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const getToken = () => localStorage.getItem('JWT_token');

  const authorized = (callback: (token: string) => void) => {
    const token = getToken();
    if (token) {
      callback(token);
    } else {
      router.push('/login');
    }
  };

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
            body: JSON.stringify({ recipientId: user.id }),
          });
          if (!res.ok) throw new Error('Failed to follow user');
          setIsFollowing(true);
          updateFollowList(user.id, true);
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          const res = await fetch(
            `/api/profile/unfollow?recipientId=${user.id}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!res.ok) throw new Error('Failed to unfollow user');
          setIsFollowing(false);
          updateFollowList(user.id, false);
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-md">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <h3 className="text-md font-semibold">{user.name}</h3>
            <button
              onClick={handleFollowToggle}
              className="px-2 py-[0.15rem] text-xs border border-blue-500 text-blue-500 rounded-2xl hover:bg-blue-50"
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">@{user.title}</p>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
