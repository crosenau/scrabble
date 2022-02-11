import Tile from './Tile';
import { get2dPos, editBoardByFilter } from '../utils/boardUtils';

export default function Board({ board, setBoard, grabbedTile, setGrabbedTile, setLetterSelectVisible }) {
  const tileClickHandler = (e, tile, index) => {
    if (grabbedTile !== null) return;
    let updatedBoard = JSON.parse(JSON.stringify(board));
    editBoardByFilter(
      updatedBoard,
      (square) => square.tile && !square.tile.played,
      (square) => square.tile.className = 'tile'
    )

    const pos2d = get2dPos(index);
    updatedBoard[pos2d[0]][pos2d[1]].tile = null;
    setBoard(updatedBoard);
    setGrabbedTile({
      ...tile,
      letter: tile.points > 0 ? tile.letter : null,
      className: 'tile-grabbed',
      grabbed: true,
      dragPosX: `${e.clientX - 20}px`,
      dragPosY: `${e.clientY - 20}px`,
    });
  }

  const boardClickHandler = (index) => {
    if (grabbedTile === null) return;
    let updatedBoard = JSON.parse(JSON.stringify(board));
    const pos2d = get2dPos(index);
    updatedBoard[pos2d[0]][pos2d[1]].tile = {
      ...grabbedTile,
      grabbed: false,
      className: 'tile'
    };
    editBoardByFilter(
      updatedBoard,
      (square) => square.tile && !square.tile.played,
      (square) => square.tile.className = 'tile'
    )
    setBoard(updatedBoard);
    if (grabbedTile.letter === null) {
      setLetterSelectVisible(true);
    }

    setGrabbedTile(null);
  }

  return (
    <div className='board'>
    {board.flat().map((square, i) => {
      return square.tile ? (
        <Tile 
          clickHandler={(e) => tileClickHandler(e, square.tile, i)}
          tile={square.tile}
          index={i}
          fromRack={false}
          key={i}
        />
      )
      : (
      <div 
        className={square.className} 
        onClick={() => boardClickHandler(i)}
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
