import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Socket, Server } from 'socket.io';

import { socketController } from './controller/socket';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  socketController(socket);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
