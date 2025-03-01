'use client';
import React, { useState } from 'react';
import { IoSendOutline } from 'react-icons/io5';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
}) => {
  const [rows, setRows] = useState(2);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    const lineBreaks = e.target.value.split('\n').length;
    setRows(lineBreaks > 2 ? 2 : lineBreaks); // Max 5 lines
  };

  return (
    <div className="relative flex gap-2 text-sm">
      <textarea
        placeholder="Type a message..."
        value={newMessage}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        rows={rows}
        className="flex-1  resize-none outline-none rounded-full pr-10 p-2 px-5 border max-h-32 overflow-hidden"
        style={{ scrollbarWidth: 'none', overflowY: 'hidden' }} // Hide scrollbar
      />
      <IoSendOutline
        onClick={handleSendMessage}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
        size={20}
      />
    </div>
  );
};

export default MessageInput;
