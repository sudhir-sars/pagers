'use client';

import React from 'react';

import Navbar from '@/components/navbar/Navbar';
import ProfileSidebar from '@/components/layout/ProfileSidebar';

import ProfileView from '@/components/profile/profile';
import { useParams } from 'next/navigation';
const PostPage: React.FC = () => {
  const { id } = useParams();

  return (
    <>
      <Navbar />
      <ProfileSidebar />
      {/* <RightSidebar /> */}
      <div className="w-[75vw] mx-auto mt-6 relative">
        <main className="ml-[calc(300px+1rem)] mr-[calc(300px+1rem)] mt-[6.5rem]">
          <section>
            <div className="flex flex-col gap-4">
              <ProfileView id={id} isOwnProfile={false} />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default PostPage;
