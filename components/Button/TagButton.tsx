import React from 'react';

interface TagButtonProps {
  text: string;
  color: 'blue' | 'red' | 'green' | 'purple' | 'yellow' | 'indigo' | 'pink';
}

const colorClasses: Record<
  TagButtonProps['color'],
  { bg: string; text: string }
> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
  red: { bg: 'bg-red-100', text: 'text-red-700' },
  green: { bg: 'bg-green-100', text: 'text-green-700' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700' },
};

const TagButton: React.FC<TagButtonProps> = ({ text, color }) => {
  const { bg, text: textColor } = colorClasses[color];
  return (
    <span
      className={`px-[9px] text-nowrap py-[2px] rounded-full text-xs font-medium ${bg} ${textColor}`}
    >
      {text}
    </span>
  );
};

export default TagButton;
