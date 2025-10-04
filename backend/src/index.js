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
const authMiddleware = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// Socket.IO
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' }
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

app.get('/', (req, res) => res.json({ ok: true, msg: 'Nursing follow-up API' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket handling (simple)
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`socket ${socket.id} joined ${userId}`);
  });
  socket.on('sendMessage', (payload) => {
    // payload: { toUserId, message }
    io.to(payload.toUserId).emit('newMessage', payload);
  });
});
