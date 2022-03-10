import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute.js';
import Game from './components/Game.js';
import NewGame from './components/navigation/NewGame.js';
import NewUser from './components/NewUser.js';
import MyGames from './components/navigation/MyGames.js';
import BrowseGames from './components/navigation/BrowseGames.js';
import Navbar from './components/navigation/Navbar.js';
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
