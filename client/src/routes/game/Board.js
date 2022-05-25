import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import Tile from './Tile';
import './game.scss';

export default function Board({ board, players, turns }) {
  const { user } = useContext(UserContext);

  const isPlayersTurn = players[turns % players.length].userId === user.id;

  return (
    <div 
      className="board"
      style={isPlayersTurn ? null : {
        pointerEvents: 'none',
        cursor: 'default'
      }}
    >
    {board.flat().map((cell) => (
      <div 
        className={cell.className}
        data-index={cell.index}
        key={cell.index}
      >
        {cell.tile ? 
          <Tile 
            tile={cell.tile}
          />
        : 
          cell.text 
        }
      </div>
    ))}
    </div>
  );
}
