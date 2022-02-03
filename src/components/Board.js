import Tile from './Tile.js';

const Board = (props) => {
  return (
    <div className='board'>
    {props.gameBoard.flat().map((square, i) => {
      return square.tile ? (
        <Tile 
          grabTile={props.grabTile}
          tile={square.tile}
          index={i}
          fromRack={false}
          key={i}
        />
      )
      : (
      <div 
        className={square.className} 
        onMouseUp={() => props.placeTile(i, false)}
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

export default Board;