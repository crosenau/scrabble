import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../../contexts/GameContext';
import { UPDATE_GAME } from '../../constants';


export default function GameList({ games, buttonLabel }) {
  const navigate = useNavigate();
  const { setGameState } = useContext(GameContext);

  return (
    <div className="game-list">
      {games.map((game, i) => (
        <div className="game-list-item" key={i}>
          <div className="game-info">
          <div className="game-name">{game.name}</div>
          <div className="player-slots">{
            `${game.players.filter(player => player.userId !== null).length}/${game.players.length} players`
          }</div>
          </div>
          <button 
            onClick={() => {
              setGameState(game, UPDATE_GAME);
              navigate('../game');
            }}>{buttonLabel}</button>
        </div>
      ))}
    </div>
  );
}
