import express from 'express';
import { Server } from "socket.io";
import webPush from 'web-push';
import fs from 'fs'
import { createSecureServer } from 'http2';
import http2Express from 'http2-express-bridge';
import cors from 'cors';
import { createServer } from 'http';
import type { PushSubscription }  from 'web-push';

const app = http2Express(express)
app.use(express.static('public'));
app.use(cors())
app.use(express.json());

const httpServer = createServer(app)
const option = {
  key: fs.readFileSync('../certs/cert.key'),
  cert: fs.readFileSync('../certs/cert.crt'),
  allowHTTP1: true,
}
const httpsServer = createSecureServer(option, app)

const io = new Server(httpsServer, {
  cors: {
    origin: 'https://d035e17593b2.ngrok.app',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

const vapidKeys = {
  publicKey: 'BOjlwhhtS_YPIXaQ5kzWFfV4UyA1gKgmchyo0j84J8nMid6Ni1xaCxZF7ercCUtJ-697Gd2qZTBXciTTHEWHPYY',
  privateKey: 'Zf0kPtiOEJz7qN0DfjwkJQk4fKuAltrE1s0IOEIL3sw'
}

// const vapidKeys = webPush.generateVAPIDKeys();

webPush.setVapidDetails(
  'mailto:dinohan.dev@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey,
)

interface User {
  id: string;
  subscription?: PushSubscription;
}

const users: User[] = [];

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/vapidPublicKey', (req, res) => {
  res.status(200).json({
    data: vapidKeys.publicKey
  })
});

app.post('/register', function(req, res) {
  const newId = Math.random().toString(36).substring(7);
  const newUser = {
    id: newId,
  };
  users.push(newUser);
  console.log('register', newUser)
  res.status(201).json({
    data: {
      id: newId
    }
  });
});

app.post('/subscription', (req, res) => {
  console.log('@@@', req.body)
  const id = req.body.user;
  const subscription = req.body.subscription;
  const user = users.find(user => user.id === id);

  if (user) {
    user.subscription = subscription;
  }

  res.sendStatus(201);
})

app.post('/sendNotification', (req, res) => {
  const subscription = req.body.subscription;
  const payload = req.body.payload;
  const options = {
    TTL: req.body.ttl
  };

  setTimeout(function() {
    webPush.sendNotification(subscription, payload, options)
    .then(function() {
      res.sendStatus(201);
    })
    .catch(function(error) {
      console.log(error);
      res.sendStatus(500);
    });
  }, req.body.delay * 1000);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('login', (user) => {
    console.log('login', user);
    users.push(user);
  });
  socket.on('write', ({ user, msg }) => {
    console.log('message', user, msg);
    socket.broadcast.emit('msg', { user, msg });
    users.forEach(receiver => {
      console.log(receiver)
      if (receiver.subscription && receiver.id !== user) {

        webPush.sendNotification(receiver.subscription, JSON.stringify({
          title: user,
          msg,
        }), {
          TTL: 60
        })
        .then(function() {
          console.log('success')
        })
        .catch(function(error) {
          console.log(error);
        });
      }
    })
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

httpsServer.listen(3000, () => {
  console.log('listening on *:3000');
})