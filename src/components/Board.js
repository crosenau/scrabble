import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import Tile from './Tile';

export default function Board() {
  const { board, grabTileFromBoard, placeTileOnBoard } = useContext(GameContext);

  return (
    <div className="board">
    {board.flat().map((square, i) => {
      return square.tile ? (
        <Tile 
          clickHandler={(e) => grabTileFromBoard(e, square.tile, i)}
          tile={square.tile}
          index={i}
          fromRack={false}
          key={i}
        />
      )
      : (
      <div 
        className={square.className} 
        onClick={() => placeTileOnBoard(i)}
        key={i}
      >
        {square.text && (
          <div className="square-white-text">
            {square.text}
          </div>
        )}
      </div>
      );
    })}
    </div>
  );
}
