'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';
import Navbar from '@/components/navbar/Navbar';
import ProfileSidebar from '@/components/layout/ProfileSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import FeedPost from '@/components/feed/FeedPost';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PostPage: React.FC = () => {
  const { id } = useParams();

  // Fetch the post data when an id exists
  const { data, error } = useSWR(id ? `/api/post?id=${id}` : null, fetcher);

  if (error) return <div>Error loading post.</div>;
  if (!data) return <div>Loading...</div>;

  const { post } = data;
  if (!post) return <div>Post not found.</div>;

  return (
    <>
      <Navbar />
      <ProfileSidebar />
      <RightSidebar />
      <div className="w-[75vw] mx-auto mt-6 relative">
        <main className="ml-[calc(300px+1rem)] mr-[calc(300px+1rem)] mt-[6.5rem]">
          <section>
            <div className="flex flex-col gap-4">
              <FeedPost key={post.id} post={post} />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default PostPage;
