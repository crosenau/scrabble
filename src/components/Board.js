import Tile from './Tile';

export default function Board({ gameBoard, grabTile, placeTile }) {
  return (
    <div className='board'>
    {gameBoard.flat().map((square, i) => {
      return square.tile ? (
        <Tile 
          clickHandler={grabTile}
          tile={square.tile}
          index={i}
          fromRack={false}
          key={i}
        />
      )
      : (
      <div 
        className={square.className} 
        onClick={() => placeTile(i, false)}
        key={i}
      >
        {square.text && (
          <div className='square-white-text'>
            {square.text}
          </div>
        )}
      </div>
      );
    })}
    </div>
  );
}
