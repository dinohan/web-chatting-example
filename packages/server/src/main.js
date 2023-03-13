const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://127.0.0.1:5173',
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

http.listen(3000, () => {
  console.log('listening on *:3000');
});