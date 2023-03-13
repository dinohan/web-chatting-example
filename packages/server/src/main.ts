import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://127.0.0.1:5174',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('write', ({ user, msg }) => {
    console.log('message', user, msg);
    socket.broadcast.emit('msg', { user, msg });
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});