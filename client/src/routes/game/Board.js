import { useContext } from 'react';
import { GameContext } from '../../contexts/GameContext';
import { UserContext } from '../../contexts/UserContext';
import Tile from './Tile';
import './board.scss';

export default function Board() {
  const { board, players, turns } = useContext(GameContext);
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
            style={{ 
              position: 'absolute',
              transform: 'scale(0.98)'
            }}
          />
        : 
          cell.text 
        }
      </div>
      
    ))}
    </div>
  );
}
