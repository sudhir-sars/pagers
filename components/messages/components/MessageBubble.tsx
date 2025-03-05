'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IMessage } from '@/lib/types';

interface MessageBubbleProps {
  message: IMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
}) => {
  // Helper to format the message timestamp
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  console.log(message);

  // Render content based on message type
  const renderMessageContent = () => {
    if (message.type === 'POST_SHARE') {
      return (
        <Link href={`/post/${message.postId}`} className="block">
          <div className="cursor-pointer p-2 ">
            <p className="mb-1 text-sm">{message.sender.name} shared a post</p>
            {message.post && (
              <div>
                <p className="text-sm">{message.post.brief}</p>
                {message.post.extendedDescription && (
                  <p className="text-xs text-gray-500">
                    {/* {message.post.brief.slice(0, 100)}... */}
                    {/* {message.post.extendedDescription.slice(0, 100)}... */}
                  </p>
                )}
              </div>
            )}
          </div>
        </Link>
      );
    }

    // Default: render text content for other message types
    return <div>{message.content}</div>;
  };

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
            src={message.sender.image}
            alt={message.sender.name}
            className="h-8 w-8 rounded-full object-cover mr-2"
          />
        </div>
      )}

      <div
        className={`flex items-center max-w-[20vw] p-2 rounded ${
          isCurrentUser
            ? 'border rounded-xl rounded-tr-none pl-2'
            : 'bg-border rounded-xl rounded-tl-none'
        }`}
      >
        <div className="flex-1">{renderMessageContent()}</div>
        <div className="text-[0.6rem] ml-2 mt-auto text-gray-300">
          {formattedTime}
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
