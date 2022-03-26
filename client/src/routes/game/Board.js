import { useContext } from 'react';
import { GameContext } from '../../contexts/GameContext';
import { UserContext } from '../../contexts/UserContext';
import Tile from './Tile';

export default function Board() {
  const { board, grabTileFromBoard, placeTileOnBoard, players, turns } = useContext(GameContext);
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
    {board.flat().map((square, i) => {
      return square.tile ? (
        <Tile 
          handleMouseDown={grabTileFromBoard}
          handleMouseUp={placeTileOnBoard}
          tile={square.tile}
          index={i}
          fromRack={false}
          key={i}
        />
      )
      : (
      <div 
        className={square.className} 
        onMouseUp={() => placeTileOnBoard(i)}
        key={i}
      >
        {square.text && (
          <div className="board__square-white-text">
            {square.text}
          </div>
        )}
      </div>
      );
    })}
    </div>
  );
}
