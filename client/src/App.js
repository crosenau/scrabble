import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute.js';
import Game from './routes/game/Game.js';
import NewGame from './routes/menus/NewGame.js';
import NewUser from './routes/menus/NewUser.js';
import MyGames from './routes/menus/MyGames.js';
import PublicGames from './routes/menus/PublicGames.js';
import Navbar from './components/Navbar.js';
import UserContextProvider from './contexts/UserContext.js';
import SocketContextProvider from './contexts/SocketContext.js';
import GameContextProvider from './contexts/GameContext.js';

export default function App() {
  return (
    <BrowserRouter>
    <div className="app">
      <SocketContextProvider>
        <UserContextProvider>
          <GameContextProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<NewUser />} />
              <Route path="/newgame" element={<PrivateRoute component={NewGame} />} />
              <Route path="/mygames" element={<PrivateRoute component={MyGames} />} />
              <Route path="/publicgames" element={<PrivateRoute component={PublicGames} />} />
              <Route path="/game" element={<PrivateRoute component={Game} />} />
            </Routes>
          </GameContextProvider>
        </UserContextProvider>
      </SocketContextProvider>
    </div>
    </BrowserRouter>
  );
}
