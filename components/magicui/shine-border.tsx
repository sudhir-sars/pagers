'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  borderWidth?: number;
  duration?: number;
  shineColor?: string | string[];
}

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = '#000000',
  className,
  style,
  ...props
}: ShineBorderProps) {
  const [currentColor, setCurrentColor] = React.useState<string>(
    Array.isArray(shineColor) ? shineColor[0] : shineColor
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColor(getRandomColor());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={
        {
          '--border-width': `${borderWidth}px`,
          '--duration': `${duration}s`,
          '--mask-linear-gradient': `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          '--background-radial-gradient': `radial-gradient(transparent, transparent, ${currentColor}, transparent, transparent)`,
          backgroundImage: 'var(--background-radial-gradient)',
          backgroundSize: '300% 300%',
          mask: 'var(--mask-linear-gradient)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        'pointer-events-none absolute inset-0 size-full rounded-[inherit] p-[--border-width] will-change-[background-position] motion-safe:animate-shine',
        className
      )}
      {...props}
    />
  );
}
