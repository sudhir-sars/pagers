'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar'; // Assuming Navbar moved to layout/ if desired
import ProfileSidebar from '@/components/layout/ProfileSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import ComposePost from '@/components/feed/ComposePost';
import FeedPost from '@/components/feed/FeedPost';

export default function FeedPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to get token from localStorage
  const getLocalStorageItem = (key: string) =>
    typeof window !== 'undefined' ? localStorage.getItem(key) : null;

  // Redirect if not authenticated
  const redirectToSignup = (errorMsg: string) => {
    console.error(errorMsg);
    localStorage.clear();
    window.location.href = '/login';
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get('JWT_token');
    if (jwtToken) {
      localStorage.setItem('userIdToken', jwtToken);
      window.history.replaceState(null, '', window.location.pathname);
    }
    const token = getLocalStorageItem('userIdToken');
    if (!token) {
      redirectToSignup('No authentication token found');
    } else {
      setIsAuthorized(true);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <>
      <Navbar />
      <ProfileSidebar />
      <RightSidebar />
      <div className="w-[75vw] mx-auto mt-6 relative">
        <main className="ml-[calc(300px+1rem)] mr-[calc(300px+1rem)] mt-[6.5rem]">
          <ComposePost />
          <section>
            <div className="flex flex-col gap-4">
              {/* Render multiple FeedPosts, either from state or hard-coded for now */}
              <FeedPost
                id={1}
                authorName="John Doe"
                authorAvatar="/path/to/profile.jpg"
                authorTitle="Passionate Software Developer"
                content="A brief description of the project idea goes here..."
              />
              {/* Additional FeedPost components */}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
