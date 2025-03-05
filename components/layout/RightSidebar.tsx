'use client';
import React from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShineBorder } from '../magicui/shine-border';

const RightSidebar = () => {
  const { theme } = useTheme();
  return (
    <>
      <aside className="w-[300px] fixed right-[calc((100vw-76vw)/2)] top-[6.5rem]">
        <Card className="relative overflow-hidden">
          <ShineBorder
            borderWidth={1.2}
            shineColor={theme === 'dark' ? 'white' : 'black'}
          />
          <CardHeader>
            <CardTitle>Automated Mail Server</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              One-click deployment using Golang, Azure, and Terraform.
            </p>
          </CardContent>
        </Card>
      </aside>

      <aside className="w-[300px] fixed right-[calc((100vw-76vw)/2)] top-[16.8rem]">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <p className="text-sm">More projects on the way!</p>
          </CardContent>
        </Card>
      </aside>
    </>
  );
};

export default RightSidebar;
