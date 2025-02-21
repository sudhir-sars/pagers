'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const RightSidebar = () => {
  return (
    <>
      <aside className="w-[300px] fixed right-[calc((100vw-76vw)/2)] top-[6.5rem]">
        <Card>
          <CardHeader>
            <CardTitle>Featured Project 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              A brief description for the first featured project.
            </p>
          </CardContent>
        </Card>
      </aside>

      <aside className="w-[300px] fixed right-[calc((100vw-76vw)/2)] top-[16.8rem]">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Additional Content</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <p className="text-sm">
              Future content or features will be placed here.
            </p>
          </CardContent>
        </Card>
      </aside>
    </>
  );
};

export default RightSidebar;
