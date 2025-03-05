'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import ProfileSidebar from '@/components/layout/ProfileSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import ComposePost from '@/components/feed/ComposePost';
import FeedPost from '@/components/feed/FeedPost';
import ComposeProject from '@/components/project/ComposeProject';
import ProfileView from '@/components/profile/profile';
import MessagesDialog from '@/components/messages/MessagesDialog';
import NotificationsFeed from '@/components/notifications/NotificationsDropdown';
import { WebSocketProvider } from '@/context/WebSocketContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { useWebSocket } from '@/context/WebSocketContext';
import { IPost, IUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import FeedSearchResult from '@/components/searchResult/FeedSearchResult';
export default function FeedPage() {
  const { socket } = useWebSocket();
  const getToken = () => localStorage.getItem('JWT_token');

  const redirectToSignup = (errorMsg: string) => {
    console.error(errorMsg);
    localStorage.clear();
    window.location.href = '/login';
  };

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [feedType, setFeedType] = useState<
    'home' | 'following' | 'projects' | 'editors-choice'
  >('home');
  const [currentView, setCurrentView] = useState<
    | 'feed'
    | 'profile'
    | 'settings'
    | 'project-create'
    | 'notifications'
    | 'search'
  >('feed');
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query
  const [searchInput, setSearchInput] = useState<string>('');
  const [messageTarget, setMessageTarget] = useState<IUser | null>(null);
  const [isMessagesOpen, setIsMessagesOpen] = useState<boolean>(false);

  // Global following list state
  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);
  // Global liked posts state (IDs only)
  const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
  // Global share users list state
  const [shareUsers, setShareUsers] = useState<
    { id: string; name: string; image: string }[]
  >([]);

  // Update the following list globally on follow/unfollow actions
  const updateFollowList = (userId: string, isFollowing: boolean) => {
    setFollowedUserIds((prev) => {
      if (isFollowing) {
        return prev.includes(userId) ? prev : [...prev, userId];
      } else {
        return prev.filter((id) => id !== userId);
      }
    });
  };
  useEffect(() => {
    if (searchInput.length > 4) {
      setCurrentView('search');
      setSearchQuery(searchInput); // Update searchQuery for displaying results
    } else {
      setCurrentView('feed');
      setFeedType('home'); // Revert to 'Home' feed when input is empty or <= 4
    }
  }, [searchInput]);

  // Initial token check and setup
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get('JWT_token');
    if (jwtToken) {
      localStorage.setItem('JWT_token', jwtToken);
      window.history.replaceState(null, '', window.location.pathname);
    }
    const token = getToken();
    if (!token) {
      redirectToSignup('No authentication token found');
    } else {
      setIsAuthorized(true);
      setIsLoading(false);
    }
  }, []);

  // Fetch the global following list once authorized
  useEffect(() => {
    const fetchFollowing = async () => {
      const token = getToken();
      try {
        const res = await fetch('/api/profile/following', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFollowedUserIds(data.following);
        } else {
          console.error('Failed to fetch following list');
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (isAuthorized) {
      fetchFollowing();
    }
  }, [isAuthorized]);

  // Fetch liked post IDs once authorized
  useEffect(() => {
    const fetchLikedPosts = async () => {
      const token = getToken();
      try {
        const res = await fetch('/api/profile/liked', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLikedPostIds(data.likedPostIds);
        } else {
          console.error('Failed to fetch liked posts');
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (isAuthorized) {
      fetchLikedPosts();
    }
  }, [isAuthorized]);

  // Fetch share users once authorized
  useEffect(() => {
    const fetchShareUsers = async () => {
      const token = getToken();
      try {
        const res = await fetch('/api/post/share', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setShareUsers(data.users);
        } else {
          console.error('Failed to fetch share users');
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (isAuthorized) {
      fetchShareUsers();
    }
  }, [isAuthorized]);

  // Fetch posts for the feed
  useEffect(() => {
    if (isAuthorized && currentView === 'feed') {
      fetchPosts(1, feedType);
    }
  }, [isAuthorized, currentView, feedType]);

  const fetchPosts = async (pageNumber: number, feedType: string) => {
    const token = getToken();
    try {
      const res = await fetch(
        `/api/feed?type=${feedType}&page=${pageNumber}&limit=20`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      if (data.posts.length < 20) {
        setHasMore(false);
      }
      if (pageNumber === 1) {
        setPosts(data.posts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewPostSubmit = async (postData: {
    content: string;
    media?: {
      url: string;
      type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'GIF';
      altText?: string;
      order?: number;
    }[];
    poll?: { question: string; options: string[] };
  }) => {
    const token = getToken();
    try {
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      if (!res.ok) throw new Error('Failed to create post');
      const data = await res.json();
      setPosts((prevPosts) => [data.post, ...prevPosts]);
    } catch (error) {
      console.error(error);
    }
  };

  // Listen for new posts over WebSocket
  useEffect(() => {
    if (!socket || currentView !== 'feed' || feedType !== 'following') return;
    const handleNewPost = (post: IPost) => {
      setPosts((prev) => [post, ...prev]);
    };
    socket.on('newPost', handleNewPost);
    return () => {
      socket.off('newPost', handleNewPost);
    };
  }, [socket, currentView, feedType]);

  const handleNewProjectSubmit = () => {
    setCurrentView('feed');
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchPosts(nextPage, feedType);
    setPage(nextPage);
  };

  const handleFeedTypeChange = (
    newFeedType: 'home' | 'following' | 'projects' | 'editors-choice'
  ) => {
    setFeedType(newFeedType);
    setCurrentView('feed');
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(1, newFeedType);
  };

  const handleMessageTarget = (target?: IUser) => {
    if (target) {
      setMessageTarget(target);
    }
    setIsMessagesOpen(true);
  };

  const handleViewChange = (
    newView: 'profile' | 'settings' | 'project-create' | 'notifications'
  ) => {
    setCurrentView(newView);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <>
      <WebSocketProvider>
        <NotificationProvider>
          <Navbar
            onFeedTypeChange={handleFeedTypeChange}
            onMessageClick={handleMessageTarget}
            onViewChange={handleViewChange}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
          <ProfileSidebar
            onFeedTypeChange={handleFeedTypeChange}
            onViewChange={handleViewChange}
          />
          {(currentView === 'feed' || currentView === 'notifications') && (
            <RightSidebar />
          )}
          <div className="w-[75vw] mx-auto mt-6 relative">
            <main className="ml-[calc(300px+1rem)] mr-[calc(300px+1rem)] mt-[6.5rem]">
              {currentView === 'feed' && (
                <>
                  <ComposePost onPostSubmit={handleNewPostSubmit} />
                  <section>
                    <div className="flex flex-col gap-4">
                      {posts.length > 0 ? (
                        posts.map((post) => (
                          <FeedPost
                            key={post.id}
                            post={post}
                            followedUserIds={followedUserIds}
                            updateFollowList={updateFollowList}
                            likedPostIds={likedPostIds}
                            shareUsers={shareUsers}
                          />
                        ))
                      ) : (
                        <div>No posts available</div>
                      )}
                    </div>
                    {hasMore && (
                      <div className="my-4 mb-20 flex justify-center">
                        <Button variant={'outline'} onClick={handleLoadMore}>
                          Load More
                        </Button>
                      </div>
                    )}
                  </section>
                </>
              )}
              {currentView === 'profile' && (
                <ProfileView token={getToken() as string} />
              )}
              {currentView === 'notifications' && <NotificationsFeed />}
              {currentView === 'settings' && (
                <div>Settings view coming soon...</div>
              )}
              {currentView === 'project-create' && (
                <ComposeProject onProjectSubmit={handleNewProjectSubmit} />
              )}
              {currentView === 'search' && (
                <FeedSearchResult
                  query={searchQuery}
                  followedUserIds={followedUserIds}
                  updateFollowList={updateFollowList}
                  likedPostIds={likedPostIds}
                  shareUsers={shareUsers}
                />
              )}
            </main>
          </div>
          <MessagesDialog
            open={isMessagesOpen}
            setOpen={setIsMessagesOpen}
            initialTarget={messageTarget || undefined}
          />
        </NotificationProvider>
      </WebSocketProvider>
    </>
  );
}
