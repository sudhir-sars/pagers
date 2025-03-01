'use client';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LuMessageSquareDot } from 'react-icons/lu';
import { IUser, IConversation } from '@/lib/types';
import ConversationList from './components/ConversationList';
import MessageWindow from './components/MessageWindow';
import MessageInput from './components/MessageInput';
import Image from 'next/image';

const MessagesDialog: React.FC = () => {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<IConversation | null>(null);
  const [pendingRecipient, setPendingRecipient] = useState<IUser | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<IUser[]>([]);

  // Retrieve token and current user id from localStorage
  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('JWT_token') : null;
  const currentUserId =
    typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  const fetchConversations = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      setConversations(data.conversations);
      if (data.conversations.length > 0) {
        setSelectedConversation(data.conversations[0]);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // Remove fetchConversations from useEffect
  useEffect(() => {
    fetchConversations();
  }, []);

  // Search for users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`/api/profile/search?query=${searchQuery}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to search users');
        const data = await res.json();
        setSearchResults(data.users);
      } catch (error) {
        console.error(error);
      }
    };

    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle selecting a user from search results
  const handleSelectUser = (user: IUser) => {
    setPendingRecipient(user);
    setSelectedConversation(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle selecting an existing conversation
  const handleSelectConversation = (conv: IConversation) => {
    setSelectedConversation(conv);
    setPendingRecipient(null);
  };

  // Simplified: Single endpoint POST to send message (or create new conversation if needed)
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const token = getToken(); // Gets the JWT from local storage
    if (!token) return;

    const payload: {
      conversationId?: string;
      recipientId?: string;
      content: string;
    } = {
      content: newMessage.trim(),
    };
    console.log(selectedConversation);
    console.log(pendingRecipient);

    if (selectedConversation) {
      payload.conversationId = selectedConversation.id;
    } else if (pendingRecipient) {
      payload.recipientId = pendingRecipient.userId;
    }
    console.log(payload);

    try {
      const res = await fetch('/api/messages', {
        // Make sure endpoint matches your backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();

      if (selectedConversation) {
        setSelectedConversation({
          ...selectedConversation,
          messages: [...selectedConversation.messages, data.message],
        });
      } else {
        setConversations((prev) => [data.conversation, ...prev]);
        setSelectedConversation(data.conversation);
        setPendingRecipient(null);
      }
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchConversations()}>
      <DialogTrigger asChild>
        <LuMessageSquareDot size={23} />
      </DialogTrigger>
      <DialogContent className="p-0 h-[74vh] w-[60vw]">
        <DialogHeader className="hidden">
          <DialogTitle className="hidden">Messages</DialogTitle>
          <DialogDescription>
            {loading ? 'Loading conversations...' : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-full">
          <div className="w-1/3 border-r">
            <ConversationList
              conversations={conversations}
              searchResults={searchResults}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectConversation={handleSelectConversation}
              onSelectUser={handleSelectUser}
              currentUserId={currentUserId}
            />
          </div>
          <div className="flex-1 flex flex-col p-4">
            {/* Replace the "Conversation with" text with the user avatar and name */}
            <div className="mb-4 flex items-center">
              {selectedConversation || pendingRecipient ? (
                <>
                  <div className="flex items-center mr-2">
                    {/* Display Avatar */}
                    <Image
                      width={40}
                      height={40}
                      src={
                        selectedConversation
                          ? selectedConversation.participants.find(
                              (p) => p.userId !== currentUserId
                            )?.userProfile.image
                          : pendingRecipient?.image || '/default-avatar.png' // Fallback to a default avatar if there's no image
                      }
                      alt={
                        selectedConversation
                          ? selectedConversation.participants.find(
                              (p) => p.userId !== currentUserId
                            )?.userProfile.name
                          : pendingRecipient?.name
                      }
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    {/* Display Name */}
                    <span className="font-bold text-lg">
                      {selectedConversation
                        ? selectedConversation.participants.find(
                            (p) => p.userId !== currentUserId
                          )?.userProfile.name
                        : pendingRecipient?.name}
                    </span>
                  </div>
                </>
              ) : (
                <p>
                  Select a conversation or search for a user to start chatting.
                </p>
              )}
            </div>

            {/* Message window and input remain unchanged */}
            {selectedConversation && (
              <MessageWindow
                conversation={selectedConversation}
                currentUserId={currentUserId}
              />
            )}
            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesDialog;
