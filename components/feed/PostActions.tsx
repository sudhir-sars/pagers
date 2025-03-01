'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  IoThumbsUpOutline,
  IoChatbubbleOutline,
  IoBookmarkOutline,
} from 'react-icons/io5';
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

interface PostActionsProps {
  post: IPost;
}

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
}
const ShareDialog: React.FC<ShareDialogProps> = ({
  postId,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState<
    { id: string; name: string; image: string }[]
  >([]);

  // For demo purposes, we use dummy data.
  useEffect(() => {
    // Replace with an API call to fetch contacts or searchable users.
    const dummyUsers = [
      { id: '1', name: 'Alice Johnson', image: '/avatars/alice.jpg' },
      { id: '2', name: 'Bob Smith', image: '/avatars/bob.jpg' },
      { id: '3', name: 'Charlie Brown', image: '/avatars/charlie.jpg' },
      // Add more users as needed
    ];
    setAvailableUsers(dummyUsers);
  }, []);

  // Filter users based on the search term.
  const filteredUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to get token from localStorage.
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('JWT_token');
    }
    return null;
  };

  // When a user is selected, call the share API.
  const handleUserSelect = async (recipientId: string) => {
    const token = getToken();
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
            className="mb-4"
          />
          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user.id)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
              </div>
            ))}
            {filteredUsers.length === 0 && (
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

const PostActions: React.FC<PostActionsProps> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes | 0);
  const [comments, setComments] = useState<IComment[]>(post.comments);
  const [newCommentText, setNewCommentText] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Helper to get token from localStorage.
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('JWT_token');
    }
    return null;
  };

  const handleLike = async () => {
    const token = getToken();
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
        setLikeCount(data.post.likes);
      } else {
        setLikeCount(likeCount + 1);
      }
      console.log(`Post ${post.id} liked`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    const token = getToken();
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
  };

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const handlePostComment = async () => {
    if (!newCommentText.trim()) return;
    const token = getToken();
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
  };

  return (
    <div className="mt-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button size="sm" variant="ghost" onClick={handleLike}>
            <IoThumbsUpOutline className="mr-1" />
            Like {formatNumber(likeCount)}
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleComments}>
            <IoChatbubbleOutline className="mr-1" />
            Comment {formatNumber(comments.length)}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShareDialogOpen(true)}
          >
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
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.author.image}
                      alt={comment.author.name}
                    />
                    <AvatarFallback>
                      {comment.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {comment.author.name}
                    </p>
                    <p className="text-xs text-gray-600">{comment.text}</p>
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-8 mt-2 space-y-2">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="flex items-start space-x-2"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={reply.author.image}
                                alt={reply.author.name}
                              />
                              <AvatarFallback>
                                {reply.author.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-semibold">
                                {reply.author.name}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {reply.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
      />
    </div>
  );
};

export default PostActions;
