import Game from './components/Game.js';
import BoardContextProvider from './contexts/BoardContext.js';
import RackContextProvider from './contexts/RackContext.js';

export default function App() {
  return (
    <div className="app">
      <Game />
    </div>
  );
}

