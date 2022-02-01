const Board = (props) => {
  return (
    <div className='board'>
    {props.gameBoard.flat().map((square, i) => {
      return square.tile ? (
        <div 
          className='tile' 
          onMouseDown={() => props.grabTile(square.tile, i, false)}
          key={i}
        >
          <div className='tile-text'>
            {square.tile.text}
          </div>
          <div className='tile-points'>
            {square.tile.points}
          </div>
        </div>
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