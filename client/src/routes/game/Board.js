import { useContext } from 'react';
import { GameContext } from '../../contexts/GameContext';
import { UserContext } from '../../contexts/UserContext';
import Tile from './Tile';
import './board.scss';

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
        <div className={square.className} key={i}>
          <Tile 
            handlePointerDown={grabTileFromBoard}
            handlePointerUp={placeTileOnBoard}
            tile={square.tile}
            style={{ 
              position: 'absolute',
              transform: 'scale(0.98)'
            }}
            index={i}
            fromRack={false}
          />
        </div>
      )
      : (
      <div 
        className={square.className} 
        //onPointerUp={() => placeTileOnBoard(i)}
        onMouseUp={() => placeTileOnBoard(i)}
        onTouchEnd={() => placeTileOnBoard(i)}
        key={i}
      >
        {square.text}
      </div>
      );
    })}
    </div>
  );
}
