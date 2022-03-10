import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';

export default function PlayerList() {
  const { players } = useContext(GameContext);
  
  return (
    <div id="player-list">
      {players.map((player, i) => (
        <div className="player" key={i}>
          <div className="player-name">
            {player.userName}
          </div>
          <div className="player-score">
            {player.score}
          </div>
        </div>
      ))}
    </div>
  );
}