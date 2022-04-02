import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import GreenButton from '../../components/GreenButton';
import { GameContext } from '../../contexts/GameContext';


export default function GameList({ games, buttonLabel }) {
  const navigate = useNavigate();
  const { setGameState } = useContext(GameContext);

  return (
    <div className="game-list">
      <div className="game-list__headers">
        <div>Game Name</div>
        <div>Players</div>
        <div>Last Activity</div>
        <div>Played Turns</div>
        <div></div>
        <hr />
      </div>
      <div className="game-list__rows">
        {games.map((game, i) => (
          <div className="game-list__row" key={i}>
            <div>{game.name}</div>
            <div>
              {`${game.players.filter(player => player.userId !== null).length}/${game.players.length}`}
            </div>
            <div>{game.lastActivity || '?'}</div>
            <div>{game.turns}</div>
            <GreenButton
              label={buttonLabel}
              type="button" 
              onClick={() => {
                setGameState(game, true);
                navigate('../game');
              }} />
          </div>
        ))}
      </div>

    </div>
  );
}
