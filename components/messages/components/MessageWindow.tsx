'use client';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <ScrollArea className="flex-1 mb-4 p-2 rounded ">
      {conversation.messages && conversation.messages.length > 0 ? (
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
  );
};

export default MessageWindow;
