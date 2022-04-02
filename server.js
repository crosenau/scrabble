'use strict';

import 'dotenv/config';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Low , JSONFile } from 'lowdb';
import { Server as SocketIO } from 'socket.io';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '/data/db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();

db.data ||= { users: [], games: [] };

const io = new SocketIO({
  cors: {
    origin: true
  }
});

io.on('connection', (socket) => {
  console.log('New socket connection: ', socket.id);

  socket.on('putUser', async (data, cb) => {
    const existingUser = db.data.users
      .filter(user => user.id === data.user.id)[0];

    if (existingUser) {
      console.log('user exists');
      existingUser.updatedAt = Date.now();

      await db.write();
    } else {
      console.log('new user')
      db.data
        .users
        .push({
          ...data.user,
          updatedAt: Date.now()
        });

      await db.write();
    }

    cb('ok');
  })

  socket.on('putGame', async (data, cb) => {
    console.log('putGame');

    const existingGameIndex = db.data.games
      .findIndex(game => game.id === data.id);

    if (existingGameIndex !== -1) {
      console.log('existing game, modifying');
      db.data.games[existingGameIndex] = data;
    } else {
      db.data.games.push(data);
    }

    await db.write();

    if (!socket.rooms.has(data.id)) {
      for (let room of socket.rooms.values()) {
        console.log(`leaving room: ${room}`);
        socket.leave(room);
      }
      console.log(`joining room: ${data.id}`);
      socket.join(data.id);
    }

    socket.to(data.id).emit('gameState', data);
    cb('ok');
  });

  socket.on('joinRoom', (id, ack) => {
    console.log('joinRoom', id);
    for (let room of socket.rooms.values()) {
      console.log(`leaving room: ${room}`);
      socket.leave(room);
    }
    console.log(`joining room: ${data.id}`);
    socket.join(data.id);

    cb('ok');
  });

  socket.on('getMyGames', userId => {
    console.log('getMyGames')
    if (db.data.games.length === 0) return;

    const gameList = db.data.games
      .filter(game => game.players.some(player => player.userId === userId));
        
    socket.emit('myGames', gameList);
  });

  socket.on('getPublicGames', userId => {
    console.log('getPublicGames', userId)
    if (db.data.games.length === 0) return;

    const gameList = db.data.games
      .filter(game => (
        game.players.every(player => player.userId !== userId)
        && game.players.some(player => !player.userId)
      ));
        
    socket.emit('publicGames', gameList);
  });
});

io.listen(3001);