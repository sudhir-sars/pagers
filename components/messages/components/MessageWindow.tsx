'use client';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming it's a custom scroll area component
import { IConversation } from '@/lib/types';
import MessageBubble from './MessageBubble';

interface MessageWindowProps {
  conversation: IConversation;
  currentUserId: string;
}

const MessageWindow: React.FC<MessageWindowProps> = ({
  conversation,
  currentUserId,
}) => {
  return (
    <div className="flex-1 mb-4 p-2 rounded  overflow-hidden ">
      {/* Make sure ScrollArea or this div has a fixed or max height */}
      <ScrollArea className="h-[54vh] px-4">
        {conversation &&
        conversation.messages &&
        conversation.messages.length > 0 ? (
          conversation.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isCurrentUser={
                msg.sender.userId === currentUserId ||
                msg.senderId === currentUserId
              }
            />
          ))
        ) : (
          <p>
            No messages yet. Type your message below to start the conversation.
          </p>
        )}
      </ScrollArea>
    </div>
  );
};

export default MessageWindow;
