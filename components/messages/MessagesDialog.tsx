// app/components/messages/MessagesDialog.tsx
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
import { IUser, IConversation } from '@/lib/types';
import ConversationList from './components/ConversationList';
import MessageWindow from './components/MessageWindow';
import MessageInput from './components/MessageInput';
import Image from 'next/image';
import { useWebSocket } from '@/context/WebSocketContext';

interface MessagesDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialTarget?: IUser;
}

const MessagesDialog: React.FC<MessagesDialogProps> = ({
  open,
  setOpen,
  initialTarget,
}) => {
  const { socket } = useWebSocket();
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<IConversation | null>(null);
  const [pendingRecipient, setPendingRecipient] = useState<IUser | null>(
    initialTarget || null
  );
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<IUser[]>([]);

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
      // If there's an initial target, check if a conversation already exists
      if (initialTarget) {
        const existingConv = data.conversations.find((conv: IConversation) =>
          conv.participants.some((p) => p.userId === initialTarget.userId)
        );
        if (existingConv) {
          setSelectedConversation(existingConv);
          setPendingRecipient(null);
        } else {
          setSelectedConversation(null);
        }
      } else if (data.conversations.length > 0 && !pendingRecipient) {
        setSelectedConversation(data.conversations[0]);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // When the dialog opens, fetch conversations.
  useEffect(() => {
    if (open) {
      fetchConversations();
    }
  }, [open]);

  // If initialTarget changes, update pendingRecipient and check for an existing conversation.
  useEffect(() => {
    if (initialTarget) {
      // Check if a conversation already exists with the initial target.
      const existingConv = conversations.find((conv) =>
        conv.participants.some((p) => p.userId === initialTarget.userId)
      );
      if (existingConv) {
        setSelectedConversation(existingConv);
        setPendingRecipient(null);
      } else {
        setPendingRecipient(initialTarget);
        setSelectedConversation(null);
      }
    }
  }, [initialTarget, conversations]);

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

  // Handle selecting a user from search results. Check if an existing conversation exists.
  const handleSelectUser = (user: IUser) => {
    const existingConv = conversations.find((conv) =>
      conv.participants.some((p) => p.userId === user.userId)
    );
    if (existingConv) {
      setSelectedConversation(existingConv);
      setPendingRecipient(null);
    } else {
      setPendingRecipient(user);
      setSelectedConversation(null);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle selecting an existing conversation
  const handleSelectConversation = (conv: IConversation) => {
    setSelectedConversation(conv);
    setPendingRecipient(null);
  };

  // Send a message (or create a new conversation if needed)
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const token = getToken();
    if (!token) return;

    const payload: {
      conversationId?: string;
      recipientId?: string;
      content: string;
    } = {
      content: newMessage.trim(),
    };

    if (selectedConversation) {
      payload.conversationId = selectedConversation.id;
    } else if (pendingRecipient) {
      payload.recipientId = pendingRecipient.userId;
    }

    try {
      const res = await fetch('/api/messages', {
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
        // New conversation created—add it to the list and select it.
        setConversations((prev) => [data.conversation, ...prev]);
        setSelectedConversation(data.conversation);
        setPendingRecipient(null);
      }
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!socket || !open) return;

    const handleNewMessage = (newMessage: any) => {
      // console.log('message: ', newMessage);
      const { conversationId, message } = newMessage;

      // Check if the conversation already exists
      const existingConv = conversations.find(
        (conv) => conv.id === conversationId
      );

      if (existingConv) {
        // Update the existing conversation with the new message
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, messages: [...conv.messages, message] }
              : conv
          )
        );

        // Update the selected conversation if it matches
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation((prev) =>
            prev ? { ...prev, messages: [...prev.messages, message] } : prev
          );
        }
      } else {
        // If the conversation doesn't exist, fetch the conversations again
        fetchConversations();
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, open, conversations, selectedConversation]);

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const token = getToken(); // Replace with actual token retrieval (e.g., from localStorage)
      const res = await fetch(`/api/messages`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ conversationId }),
      });

      if (!res.ok) {
        throw new Error('Failed to delete conversation');
      }

      // Update the conversation list by removing the deleted conversation
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );
      setSelectedConversation(null);
      setPendingRecipient(initialTarget || null);
      setNewMessage('');
      setLoading(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };
  useEffect(() => {
    if (!open) {
      setConversations([]);
      setSelectedConversation(null);
      setPendingRecipient(initialTarget || null);
      setNewMessage('');
      setLoading(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open, initialTarget]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Hidden trigger since we control open state externally */}
        <button style={{ display: 'none' }} />
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
              onDeleteConversation={handleDeleteConversation}
            />
          </div>
          <div className="flex-1 flex flex-col p-4">
            <div className="mb-4 flex items-center">
              {selectedConversation || pendingRecipient ? (
                <>
                  <div className="flex items-center mr-2">
                    <Image
                      width={40}
                      height={40}
                      src={
                        selectedConversation
                          ? selectedConversation.participants.find(
                              (p) => p.userId !== currentUserId
                            )?.userProfile.image
                          : pendingRecipient?.image || '/default-avatar.png'
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
            {(selectedConversation || pendingRecipient) && (
              <MessageWindow
                conversation={selectedConversation}
                currentUserId={currentUserId}
              />
            )}
            {(selectedConversation || pendingRecipient) && (
              <MessageInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesDialog;
