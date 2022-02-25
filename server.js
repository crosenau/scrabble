const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('./data/db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)

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

server.listen(3001, () => {
  console.log('JSON Server is running')
});