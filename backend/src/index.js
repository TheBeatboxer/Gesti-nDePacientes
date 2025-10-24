require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const nursesRoutes = require('./routes/nurses');
const vitalsRoutes = require('./routes/vitals');
const alertsRoutes = require('./routes/alerts');
const chatRoutes = require('./routes/chat');
const educationRoutes = require('./routes/education');
const appointmentRoutes = require('./routes/appointments');
const authMiddleware = require('./middleware/auth');

const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

// Socket.IO
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:4200', 'https://sistemaenfermeriaudh.online'],
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});
app.set('io', io);

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// connect DB
connectDB();

// routes public
app.use('/api/auth', authRoutes);

// protect rest with auth middleware where necessary (inside routes)
app.use('/api/patients', authMiddleware, patientRoutes);
app.use('/api/nurses', authMiddleware, nursesRoutes);
app.use('/api/vitals', authMiddleware, vitalsRoutes);
app.use('/api/alerts', authMiddleware, alertsRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/education', authMiddleware, educationRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/', (req, res) => res.json({ ok: true, msg: 'Nursing follow-up API' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket handling with authentication
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return next(new Error('Authentication error: Invalid token'));
    }
    if (!decoded || !decoded.id) {
      console.error('Invalid token payload:', decoded);
      return next(new Error('Authentication error: Invalid token payload'));
    }
    socket.user = decoded;
    console.log('Socket authenticated for user:', socket.user.id);
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}, User: ${socket.user?.id || 'unknown'}`);

  socket.on('joinChat', (otherUserId) => {
    if (!socket.user || !socket.user.id) {
      console.error('Unauthorized socket attempt to join chat');
      socket.emit('error', { message: 'Authentication required' });
      return;
    }
    const roomName = [socket.user.id, otherUserId].sort().join('_');
    socket.join(roomName);
    // Also join user's own room for personal messages
    socket.join(socket.user.id);
    console.log(`User ${socket.user.id} joined chat room: ${roomName} and personal room: ${socket.user.id}`);
  });

  socket.on('sendMessage', async (data) => {
    if (!socket.user || !socket.user.id) {
      console.error('Unauthorized socket attempt to send message');
      socket.emit('error', { message: 'Authentication required' });
      return;
    }
    console.log('Received sendMessage event:', data);
    const { recipientId, message } = data;
    const roomName = [socket.user.id, recipientId].sort().join('_');

    try {
      // Save message to database
      const newMessage = new Message({
        from: socket.user.id,
        to: recipientId,
        text: message,
        conversationId: roomName
      });
      await newMessage.save();
      console.log('Message saved:', newMessage);

      // Emit the message to the specific room (conversation room)
      io.to(roomName).emit('newMessage', {
        sender: socket.user.id,
        message: message,
        timestamp: newMessage.createdAt
      });
      console.log('Message emitted to room:', roomName, 'and recipient personal room:', recipientId, 'with data:', {
        sender: socket.user.id,
        message: message,
        timestamp: newMessage.createdAt
      });
    } catch (error) {
      console.error('Error saving message:', error);
      // Optionally, emit an error event back to the sender
      socket.emit('messageError', { message: 'Failed to send message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});
