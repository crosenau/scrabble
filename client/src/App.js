import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute.js';
import Game from './pages/game/Game.js';
import NewGame from './pages/menus/NewGame.js';
import NewUser from './pages/menus/NewUser.js';
import MyGames from './pages/menus/MyGames.js';
import BrowseGames from './pages/menus/BrowseGames.js';
import Navbar from './components/Navbar.js';
import UserContextProvider from './contexts/UserContext.js';
import GameContextProvider from './contexts/GameContext.js';

export default function App() {
  return (
    <BrowserRouter>
    <div className="app">
      <UserContextProvider>
      <GameContextProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<NewUser />} />
          <Route path="/newgame" element={<PrivateRoute component={NewGame} />} />
          <Route path="/mygames" element={<PrivateRoute component={MyGames} />} />
          <Route path="/browsegames" element={<PrivateRoute component={BrowseGames} />} />
          <Route path="/game" element={<PrivateRoute component={Game} />} />
        </Routes>
      </GameContextProvider>
      </UserContextProvider>
    </div>
    </BrowserRouter>
  );
}
