import { useNavigate } from 'react-router-dom';
import GreenButton from '../../components/GreenButton';

export default function GameList({ games, buttonLabel }) {
  const navigate = useNavigate();
  const formattedGames = games.map(game => {
    const { id, name } = game;
    const playerSlots = `${game.players.filter(player => player.userId !== null).length}/${game.players.length}`;
    const playerIdx = game.turns % game.players.length;
    const prevPlayerIdx = (game.turns - 1) % game.players.length;
    let status;

    if (game.gameOver) {
      status = `${game.players[prevPlayerIdx].userName} won!`;
    } else if (game.players[playerIdx].userId === null) {
      status = `Waiting for player to join`;
    } else {
      status = `${game.players[playerIdx].userName}'s Turn`;
    }

    return {
      id,
      name,
      playerSlots,
      status
    }
  });

  return (
    <div className="game-list">
      <div className="game-list__headers">
        <div>Name</div>
        <div>Players</div>
        <div>Status</div>
        <div></div>
        <hr />
      </div>
      <div className="game-list__rows">
        {formattedGames.map(game => (
          <div className="game-list__row" key={game.id}>
            <div>{game.name}</div>
            <div>{game.playerSlots}</div>
            <div>{game.status}</div>
            <GreenButton
              label={buttonLabel}
              type="button" 
              onClick={() => {
                navigate(`../game/${game.id}`);
              }} />
          </div>
        ))}
      </div>
    </div>
  );
}
