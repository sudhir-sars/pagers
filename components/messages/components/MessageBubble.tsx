'use client';
import React from 'react';
import { IMessage } from '@/lib/types';
import Image from 'next/image';

interface MessageBubbleProps {
  message: IMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
}) => {
  return (
    <div
      className={`flex items-start mb-2 ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Avatar for messages not sent by the current user */}
      {!isCurrentUser && (
        <div className="flex items-center justify-start">
          <Image
            width={20}
            height={20}
            src={message.sender.image} // Fallback if image is not available
            alt={message.sender.name} // Fallback if name is missing
            className="h-8 w-8 rounded-full object-cover mr-2"
          />
        </div>
      )}

      <div
        className={`flex items-center max-w-[20vw] p-2 rounded ${
          isCurrentUser
            ? 'bg-border rounded-xl rounded-tr-none pl-2'
            : 'bg-border rounded-xl rounded-tl-none'
        }`}
      >
        <div className="flex-1">{message.content}</div>
        <div className="text-[0.6rem] ml-2 mt-auto text-gray-300">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </div>
      </div>

      {/* Avatar for messages sent by the current user */}
      {isCurrentUser && (
        <div className="flex items-center justify-end">
          <Image
            width={20}
            height={20}
            src={message.sender.image}
            alt={message.sender.name}
            className="h-8 w-8 rounded-full object-cover ml-2"
          />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
