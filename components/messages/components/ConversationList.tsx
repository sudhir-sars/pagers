'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IUser, IConversation } from '@/lib/types';
import Image from 'next/image';
import { FaTrash } from 'react-icons/fa'; // Import trash icon from react-icons

interface ConversationListProps {
  conversations: IConversation[];
  searchResults: IUser[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (conv: IConversation) => void;
  onSelectUser: (user: IUser) => void;
  currentUserId: string;
  onDeleteConversation: (conversationId: string) => void; // New prop for deletion
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  searchResults,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  onSelectUser,
  currentUserId,
  onDeleteConversation, // New prop
}) => {
  // Helper: Get conversation partner (for one-on-one chats)
  // console.log(searchResults);
  const getConversationPartner = (conv: IConversation) => {
    // console.log(currentUserId);
    const partner = conv.participants.find((p) => p.userId !== currentUserId);
    return partner ? partner.userProfile : { name: 'You', image: '' };
  };

  // Helper: Get last message content
  const getLastMessageContent = (conv: IConversation) => {
    if (!conv.messages || conv.messages.length === 0) return '';
    return conv.messages[conv.messages.length - 1].content;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-full"
        />
      </div>
      <ScrollArea className="flex-1 p-2">
        {searchResults.length > 0
          ? searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="w-full text-left p-2 hover:bg-border rounded-full mb-2"
              >
                <div className="flex items-center">
                  {user.image && (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={20}
                      height={20}
                      className="h-8 w-8 rounded-full mr-2 object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs">@{user.profile?.alias}</div>
                  </div>
                </div>
              </button>
            ))
          : conversations.map((conv) => {
              const partner = getConversationPartner(conv);
              return (
                <div
                  key={conv.id}
                  className="flex justify-between items-center p-2 hover:bg-border rounded-xl mb-2"
                >
                  <button
                    onClick={() => onSelectConversation(conv)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center">
                      {partner.image && (
                        <Image
                          width={20}
                          height={20}
                          src={partner.image}
                          alt={partner.name}
                          className="h-8 w-8 rounded-full mr-2 object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {partner.name}
                        </div>
                        <div className="text-xs">
                          {getLastMessageContent(conv)}
                        </div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => onDeleteConversation(conv.id)}
                    className="ml-2  hover:text-red-700"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              );
            })}
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
