import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCrown, faUserSlash, faHeart } from '@fortawesome/free-solid-svg-icons';
import './game.scss';

export default function PlayerList({ players, turns, gameOver }) {
  const isJoined = (player) => player.userId !== null;
  
  const isActive = (player) => {
    const currentPlayerId = players[turns%players.length].userId;
    return player.userId === currentPlayerId;
  }

  const isWinner = (player) => {
    const winnerId = gameOver 
      ? [...players].sort((p1, p2) => p1.score < p2.score)[0].userId
      : null; 
    return player.userId === winnerId;
  }

  return (
    <div className="player-list">
      {players.map((player, i) => (
          <div 
            className={
              (!isJoined(player) || !isActive(player)) 
                ? 'player-list__player player-list__player--inactive'
                : 'player-list__player'
            }
            key={i}
          >
            <div className="player-list__icon">
              <FontAwesomeIcon icon={
                isJoined(player) 
                  ? isWinner(player) 
                    ? faCrown
                    : faUser
                  : faUserSlash
              } />
              <div className="player-list__hearts">
                {[1,2,3,4].map(v => (
                  v <= player.bestWords
                    ? <FontAwesomeIcon icon={faHeart} key={v} />
                    : <FontAwesomeIcon icon={faHeart} key={v} style={{ color: '#111' }} />
                ))}
             </div>
            </div>

            <div className={"player-list__name"}>
              {player.userName}
            </div>
            <div className="player-list__score">
              {`${player.score} pts`}
            </div>
          </div>
      ))}
    </div>
  );
}