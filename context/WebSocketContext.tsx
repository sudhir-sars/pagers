// app/components/WebSocketContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextType {
  socket: Socket | null;
  error: string | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  error: null,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('JWT_token');
    if (!token) {
      setError('No JWT token found');
      return;
    }

    const socketInstance = io('http://localhost:3001', {
      auth: { token },
    });

    // Connection event
    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setError(null); // Clear any previous errors
    });

    setSocket(socketInstance);

    // Cleanup on component unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, error }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
