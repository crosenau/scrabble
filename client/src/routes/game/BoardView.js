import Tile from './Tile';
import './game.scss';

export default function BoardView({ cells, isPlayersTurn }) {
  return (
    <div 
      className="board"
      style={isPlayersTurn ? null : {
        pointerEvents: 'none',
        cursor: 'default'
      }}
    >
    {cells.flat().map((cell) => (
      <div 
        className={cell.className}
        data-pos={cell.pos}
        key={cell.pos}
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
