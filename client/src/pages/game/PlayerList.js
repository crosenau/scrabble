import { useContext } from 'react';
import { GameContext } from '../../contexts/GameContext';

export default function PlayerList() {
  const { players, turns, gameOver } = useContext(GameContext);
  const winnerId = gameOver 
    ? [...players].sort((p1, p2) => p1.score < p2.score)[0].userId
    : null;
  const currentPlayerId = players[turns%players.length].userId;
  const activeId = winnerId || currentPlayerId

  return (
    <div className="player-list">
      {players.map((player, i) => (
        <div 
          className="player-list__player"
          key={i}
        >
          <div className={player.userId === activeId ? "player-list__name--active" : "player-list__name"}>
            {player.userName + (winnerId && winnerId === player.userId ? ' [Winner]' : '')}
          </div>
          <div className={player.userId === activeId ? "player-list__score--active" : "player-list__score"}>
            {player.score}
          </div>
        </div>
      ))}
    </div>
  );
}