'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IoChatbubbleOutline, IoBookmarkOutline } from 'react-icons/io5';
import { GoHeart } from 'react-icons/go';
import { FaRegShareSquare } from 'react-icons/fa';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { IComment, IPost } from '@/lib/types';
import { useRouter } from 'next/navigation';

// Helper function that formats numbers to at most three digits (including a decimal) with K/M suffixes.
const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1e6) {
    const formatted = (num / 1000).toFixed(1);
    return formatted.endsWith('.0')
      ? `${parseInt(formatted)}K`
      : `${formatted}K`;
  }
  if (num < 1e9) {
    const formatted = (num / 1e6).toFixed(1);
    return formatted.endsWith('.0')
      ? `${parseInt(formatted)}M`
      : `${formatted}M`;
  }
  return num.toString();
};

// ShareDialog component – opens a modal with a search box and a list of available users.
interface ShareDialogProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
  users: { id: string; name: string; image: string }[];
}
const ShareDialog: React.FC<ShareDialogProps> = ({
  postId,
  isOpen,
  onClose,
  users,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<
    { id: string; name: string; image: string }[]
  >([]);
  const router = useRouter();

  // Authorized helper: if token exists, execute callback; otherwise, redirect to /login.
  const authorized = (callback: (token: string) => void) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('JWT_token') : null;
    if (token) {
      callback(token);
    } else {
      router.push('/login');
    }
  };

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      authorized(async (token) => {
        try {
          const res = await fetch(
            `/api/profile/search?query=${encodeURIComponent(searchTerm)}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!res.ok) throw new Error('Failed to search users');
          const data = await res.json();
          setSearchResults(data.users);
        } catch (error) {
          console.error(error);
        }
      });
    };

    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filter the existing users prop based on the search term.
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Merge searchResults on top of filteredUsers, avoiding duplicates.
  const mergedUsers = searchTerm.trim()
    ? [
        ...searchResults,
        ...filteredUsers.filter(
          (u) => !searchResults.find((s) => s.id === u.id)
        ),
      ]
    : filteredUsers;

  // When a user is selected, call the share API.
  const handleUserSelect = async (recipientId: string) => {
    authorized(async (token) => {
      try {
        const res = await fetch('/api/post/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ postId, recipientId }),
        });
        if (!res.ok) throw new Error('Failed to share post');
        console.log(`Post ${postId} shared with recipient ${recipientId}`);
        onClose();
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 rounded-full"
          />
          <div className="max-h-60 overflow-y-auto">
            {mergedUsers.length > 0 ? (
              mergedUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  className="flex items-center space-x-3 p-2 hover:bg-border rounded-xl cursor-pointer"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No users found.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface PostActionsProps {
  post: IPost;
  initialLiked?: boolean;
  shareUsers?: { id: string; name: string; image: string }[];
}

const PostActions: React.FC<PostActionsProps> = ({
  post,
  initialLiked = false,
  shareUsers,
}) => {
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [comments, setComments] = useState<IComment[]>(post.comments);
  const [newCommentText, setNewCommentText] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const router = useRouter();

  // Authorized helper: if token exists, execute callback; otherwise, redirect to /login.
  const authorized = (callback: (token: string) => void) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('JWT_token') : null;
    if (token) {
      callback(token);
    } else {
      router.push('/login');
    }
  };

  const handleLike = async () => {
    authorized(async (token) => {
      if (liked) {
        // Unlike the post
        try {
          const res = await fetch('/api/post/unlike', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ postId: post.id }),
          });
          if (!res.ok) throw new Error('Failed to unlike post');
          const data = await res.json();
          if (data?.post?.likes !== undefined) {
            setLikeCount(likeCount - 1);
          }
          setLiked(false);
        } catch (error) {
          console.error(error);
        }
      } else {
        // Like the post
        try {
          const res = await fetch('/api/post/like', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ postId: post.id }),
          });
          if (!res.ok) throw new Error('Failed to like post');
          const data = await res.json();
          if (data?.post?.likes !== undefined) {
            setLikeCount(likeCount + 1);
          }
          setLiked(true);
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  const handleSave = async () => {
    authorized(async (token) => {
      try {
        const res = await fetch('/api/post/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ postId: post.id }),
        });
        if (!res.ok) throw new Error('Failed to save post');
        console.log(`Post ${post.id} saved`);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const toggleComments = () => setShowComments((prev) => !prev);

  const handlePostComment = async () => {
    if (!newCommentText.trim()) return;
    authorized(async (token) => {
      try {
        const res = await fetch('/api/post/comment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ postId: post.id, text: newCommentText }),
        });
        if (!res.ok) throw new Error('Failed to post comment');
        const data = await res.json();
        setComments((prev) => [...prev, data.comment]);
        setNewCommentText('');
      } catch (error) {
        console.error(error);
      }
    });
  };

  const handleShareDialogToggle = () => {
    authorized(() => {
      setShareDialogOpen((pre) => !pre);
    });
  };

  return (
    <div className="mt-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button size="sm" variant="ghost" onClick={handleLike}>
            <GoHeart
              color={liked ? 'red' : ''}
              className={`mr-1 ${liked ? '-red-600' : ''}`}
            />
            {formatNumber(likeCount)}
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleComments}>
            <IoChatbubbleOutline className="mr-1" />
            Comment {formatNumber(comments.length)}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleShareDialogToggle}>
            <FaRegShareSquare className="mr-1" />
            Share
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <IoBookmarkOutline className="mr-1" />
          Save
        </Button>
      </div>

      {showComments && (
        <div className="mt-4 border-t pt-4">
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.length > 0 &&
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-2">
                    <div>
                      <p className="text-sm font-semibold">
                        {comment.author.name}
                      </p>
                      <p className="text-xs text-gray-600">{comment.text}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No comments yet.</p>
          )}
          <div className="mt-4 flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Write a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
            <Button size="sm" variant="outline" onClick={handlePostComment}>
              Post
            </Button>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <ShareDialog
        postId={post.id}
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        users={shareUsers || []}
      />
    </div>
  );
};

export default PostActions;
