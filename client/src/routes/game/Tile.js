import './tile.scss';

export default function Tile({ tile, style, handlePointerDown, handlePointerUp, index }) {  
  return (
    <div 
      className={tile.className}
      style={style}
      onMouseDown={(e) => handlePointerDown(e, tile, index)}
      onMouseUp={(e) => handlePointerUp && handlePointerUp(index, true)}
      // onTouchStart={(e) => handlePointerDown(e, tile, index)}
      // onTouchEnd={(e) => handlePointerUp && handlePointerUp(index, false)}
      // onTouchCancel={(e) => handlePointerUp && handlePointerUp(index, false)}
      index={index}
    >
      <div className={tile.totalPoints ? "tile__total-points" : null}>
        {tile.totalPoints}
      </div>
      <div className="tile__letter">
        {tile.letter}
      </div>
      <div className="tile__points">
        {tile.points}
      </div>
    </div>
  );
}
