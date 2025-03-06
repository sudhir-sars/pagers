// Importing dependencies
import http from 'http';
import { Server as socketIo } from 'socket.io'; // Correct import for socket.io in ES module
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create HTTP server and Socket.IO instance
const server = http.createServer();
const io = new socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Adjust for your frontend URL
    methods: ['GET', 'POST'],
  },
});

// Store connected users (userId -> array of sockets for multiple tabs)
const connectedUsers = new Map();

// Middleware to authenticate WebSocket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error: No token provided'));

  try {
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET); // Ensure JWT_SECRET is set in .env
    socket.userId = decoded.userId; // Assumes your JWT payload includes userId
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Handle connections
io.on('connection', (socket) => {
  const userId = socket.userId;
  console.log(`User ${userId} connected`);

  // Store socket
  if (!connectedUsers.has(userId)) connectedUsers.set(userId, []);
  connectedUsers.get(userId).push(socket);

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
    const userSockets = connectedUsers.get(userId);
    if (userSockets) {
      const index = userSockets.indexOf(socket);
      if (index !== -1) {
        userSockets.splice(index, 1);
        if (userSockets.length === 0) connectedUsers.delete(userId);
      }
    }
  });
});

// Set up Redis subscriber

const subscriber = createClient({ url: process.env.REDIS_URL }); // Adjust Redis URL as needed
subscriber.connect().then(() => {
  subscriber.subscribe('newMessage', (data) => {
    try {
      const { recipientId, message, conversationId } = JSON.parse(data);
      // console.log(`Received message for recipientId: ${recipientId}`);

      const userSockets = connectedUsers.get(recipientId);
      // console.log(`Sockets for ${recipientId}:`, userSockets);

      if (userSockets && userSockets.length > 0) {
        userSockets.forEach((socket) => {
          socket.emit('newMessage', { message, conversationId });

          // const notification = `You have a new message from ${message.sender.name}`;
          // socket.emit('notification', notification);
          console.log(`Emitted 'newMessage' to socket ID: ${socket.id}`);
        });
      } else {
        console.log(
          `No connected sockets found for recipientId: ${recipientId}`
        );
      }
    } catch (error) {
      console.error('Error processing Redis message:', error);
    }
  });

  subscriber.subscribe('newNotification', (data) => {
    const { recipientUserId, notification } = JSON.parse(data);
    console.log(recipientUserId);
    const userSockets = connectedUsers.get(recipientUserId);
    console.log('hee');
    if (userSockets) {
      userSockets.forEach((socket) => {
        console.log('hadaee');
        return socket.emit('newNotification', notification);
      });
    }
  });

  subscriber.subscribe('newPost', (data) => {
    const { post, authorId } = JSON.parse(data);
    // Get followers of the author
    console.log(authorId, post);
    prisma.userProfile
      .findUnique({ where: { id: authorId }, include: { followers: true } })
      .then((profile) => {
        console.log(profile);
        profile.followers.forEach((follow) => {
          const userSockets = connectedUsers.get(follow.followerId);
          if (userSockets) {
            userSockets.forEach((socket) => socket.emit('newPost', post));
          }
        });
      });
  });
});

// Start the server
server.listen(3001, () => {
  console.log('Socket.IO server running on port 3001');
});

// Export the io instance
export { io };
