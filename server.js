import 'dotenv/config';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Low , JSONFile } from 'lowdb';
import express from 'express';
import { Server as SocketIO } from 'socket.io';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '/data/db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();

db.data ||= { users: [], games: [] };

const app = express();

if (process.env.NODE_ENV === 'production') {
  console.log('production');
  app.use('/', express.static(join(__dirname, '/client/build')));
  app.get('/*', (req, res) => {
    res.sendFile(join(__dirname, 'client/build', 'index.html'));
  });
}

const port = process.env.SERVER_PORT;

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const io = new SocketIO(server, {
  cors: {
    origin: true
  }
});

// Subscribe a socket to a game's room to receive state changes
const joinRoom = (socket, roomId) => {
  if (socket.rooms.has(roomId)) {
    console.log(`already in room ${roomId}`);
    return;
  };

  for (let room of socket.rooms.values()) {
    if (room !== socket.id) {
      console.log(`leaving room: ${room}`);
      socket.leave(room);
    }
  }
  
  console.log(`joining room: ${roomId}`);
  socket.join(roomId);
}

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

    joinRoom(socket, data.id);

    socket.to(data.id).emit('gameData', data);
    cb('ok');
  });

  // Triggers server to emit 'gameData' with requested id
  socket.on('getGame', gameId => {
    console.log('getGame', gameId);
    if (db.data.games.length === 0) return;

    const game = db.data.games.filter(game => game.id === gameId)[0];    
    
    if (game) {
      joinRoom(socket, gameId);
      socket.emit('gameData', game);
    }
  });

  socket.on('getMyGames', userId => {
    console.log('getMyGames', userId)
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
