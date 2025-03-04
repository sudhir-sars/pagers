'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { MoonStar, SunMedium } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styled, { keyframes } from 'styled-components';

// Define keyframes and styled component outside the component function
const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
`;

const RotatingIconSun = styled(SunMedium)`
  &:hover {
    animation: ${rotate360} 0.2s linear;
  }
`;

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  // State to track if the component has mounted
  const [mounted, setMounted] = React.useState(false);

  // This will only run once after the component mounts
  React.useEffect(() => {
    setMounted(true);
  }, []); // Empty dependency array ensures this only runs once

  if (!mounted) {
    return null; // Return nothing during the first render
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <RotatingIconSun
        size={10}
        className="rotate-0 scale-[1.25] transition-all dark:-rotate-90 dark:scale-0"
      />
      <MoonStar className=" absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
