'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IoSendOutline } from 'react-icons/io5';
import { CiImageOn } from 'react-icons/ci';
import { BiPoll } from 'react-icons/bi';

const ComposePost = () => {
  return (
    <section className="mb-4">
      <Card className="px-0 border-none shadow-none">
        <div className="flex items-center space-x-3">
          <Input
            className="py-8"
            type="text"
            placeholder="What's on your mind..."
          />
        </div>
        <CardContent className="mt-2">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                <CiImageOn size={30} />
                <span className="text-sm">Add Media</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                <BiPoll size={30} />
                <span className="text-sm">Poll</span>
              </button>
            </div>
            <Button variant="outline" className="pr-6">
              <IoSendOutline />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ComposePost;
