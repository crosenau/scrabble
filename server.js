'use strict';

const jsonServer = require('json-server');
const app = jsonServer.create();
const router = jsonServer.router('./data/db.json');
const middlewares = jsonServer.defaults();
const socketIO = require('socket.io');

const PORT = 3001;
app.use(middlewares)
app.use(router)

router.render = (req, res) => {
  let [path, queryParam, value] = req.url.split(/(?:\?|\=)/);

  if (path === '/games' && queryParam === 'players.userId') {
    if (value === 'null') value = null;
    let filteredGames = res.locals.data.filter((game) => {
      return game.players.some(player => player.userId === value);
    });

    return res.status(200).jsonp(filteredGames);
  }
  res.status(200).jsonp(res.locals.data);
}

const server = app.listen(PORT, () => {
  console.log('JSON Server is listening on port ' + PORT);
})

// socket
const io = socketIO(server, {
  cors: {
    origin: true
  }
});

io.on('connection', (socket) => {
  console.log('New socket connection: ', socket.id);
  const db = router.db;
  db.read();
  let gameId;

  socket.on('joinGame', (data, callback) => {
    console.log('joined game ', data.gameId);
    for (let room of socket.rooms.values()) {
      console.log(`leaving room: ${room}`);
      socket.leave(room);
    }
    let gameId = data.gameId;
    console.log(`joining room: ${gameId}`);
    socket.join(gameId);

    const gameState = db.get('games').value().filter(game => game.id === gameId)[0];
    socket.to(gameId).emit('gameState', gameState);

    callback({
      success: true,
      roomId: [...socket.rooms][0]
    });
  });

  socket.on('newGame', (data, callback) => {
    // this seems incorrect but it's the only way I could get the lowdb instance to write data
    
    const games = db.get('games').value();
    games.push(data.gameState)
    db.set('games', games).write();

    callback({ success: true });
  });

  socket.on('updateGame', (data, callback) => {
    const games = db.get('games').value().map(game => {
      if (game.id === data.gameState.id) {
        return data.gameState;
      }

      return game;
    })
    db.set('games', games).write();

    socket.to(data.gameState.id).emit('gameState', data.gameState);
    callback({ success: true });
  });
});
