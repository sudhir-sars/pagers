'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import ProfileSidebar from '@/components/layout/ProfileSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import ComposePost from '@/components/feed/ComposePost';
import FeedPost from '@/components/feed/FeedPost';
import ComposeProject from '@/components/project/ComposeProject';
import { IPost } from '@/lib/types';
import ProfileView from '@/components/profile/profile';
import NotificationsFeed from '@/components/notifications/NotificationsDropdown';

export default function FeedPage() {
  const getLocalStorageItem = (key: string) =>
    typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  const getToken = () => getLocalStorageItem('JWT_token');

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
    'feed' | 'profile' | 'settings' | 'project-create' | 'notifications'
  >('feed');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get('JWT_token');
    if (jwtToken) {
      localStorage.setItem('JWT_token', jwtToken);
      window.history.replaceState(null, '', window.location.pathname);
    }
    const token = getLocalStorageItem('JWT_token');
    if (!token) {
      redirectToSignup('No authentication token found');
    } else {
      setIsAuthorized(true);
      setIsLoading(false);
    }
  }, []);

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

  const handleNewProjectSubmit = () => {
    setCurrentView('feed'); // Return to feed view after submission
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

  const handleViewChange = (
    newView: 'profile' | 'settings' | 'project-create' | 'notifications'
  ) => {
    setCurrentView(newView);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <>
      <Navbar onViewChange={handleViewChange} />
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
                    posts.map((post) => <FeedPost key={post.id} post={post} />)
                  ) : (
                    <div>No posts available</div>
                  )}
                </div>
                {hasMore && (
                  <div className="mt-4 flex justify-center">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      onClick={handleLoadMore}
                    >
                      Load More
                    </button>
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
        </main>
      </div>
    </>
  );
}
