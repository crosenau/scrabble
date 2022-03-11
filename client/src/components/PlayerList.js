import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';

export default function PlayerList() {
  const { players, turns } = useContext(GameContext);
  const currentPlayer = turns % players.length;

  return (
    <div id="player-list">
      {players.map((player, i) => (
        <div 
          className="player"
          style={i === currentPlayer
            ? { border: '3px solid #0F0' }
            : null
          } 
          key={i}
        >
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