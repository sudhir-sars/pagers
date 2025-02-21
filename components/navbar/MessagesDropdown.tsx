'use client';
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { IoChatbubbleOutline } from 'react-icons/io5';
import { Button } from '../ui/button';

const MessagesDropdown = () => {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  // Example contacts data; replace with dynamic data as needed.
  const contacts = [
    { id: 1, name: 'Alice', lastMessage: 'Hey, how are you?' },
    { id: 2, name: 'Bob', lastMessage: 'Did you check the project?' },
    { id: 3, name: 'Charlie', lastMessage: "Let's catch up later!" },
  ];

  // Example conversation data; replace with actual conversation data.
  const conversation = [
    { id: 1, sender: 'Alice', message: 'Hi there!' },
    { id: 2, sender: 'me', message: 'Hello, Alice!' },
    { id: 3, sender: 'Alice', message: 'How is your project going?' },
    { id: 4, sender: 'me', message: "It's going great!" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted">
          <IoChatbubbleOutline size={24} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[45vw] max-w-4xl h-[60vh] p-0">
        <div className="flex h-full">
          {/* Left panel: Contacts list */}
          <div className="w-1/3 border-r p-2 overflow-y-auto">
            <ul>
              {contacts.map((contact) => (
                <Button
                  key={contact.id}
                  variant={'ghost'}
                  onClick={() => setSelectedContact(contact.name)}
                  className={`p-4 text-sm  cursor-pointer w-full justify-start`}
                >
                  <div></div>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-xs text-gray-500">
                    {contact.lastMessage}
                  </div>
                </Button>
              ))}
            </ul>
          </div>
          {/* Right panel: Conversation view */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedContact ? (
              <>
                <div className="mb-4 border-b pb-2 font-semibold">
                  Conversation with {selectedContact}
                </div>
                <div className="space-y-4">
                  {conversation.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === 'me' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                          msg.sender === 'me'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 mt-10">
                Select a contact to view messages.
              </div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessagesDropdown;
