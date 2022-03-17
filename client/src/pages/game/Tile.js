export default function Tile({ tile, style, handleMouseDown, handleMouseUp, index }) {  
  return (
    <div 
      className={tile.className}
      style={style}
      onMouseDown={(e) => handleMouseDown(e, tile, index)}
      onMouseUp={() => handleMouseUp && handleMouseUp(index, true)}
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
