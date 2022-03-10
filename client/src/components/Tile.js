export default function Tile({ tile, style, clickHandler, index }) {  
  return (
    <div 
      className={tile.className}
      style={style}
      onClick={(e) => clickHandler(e, tile, index)}
      index={index}
    >
      <div className={tile.totalPoints ? "tile-total-points" : null}>
        {tile.totalPoints}
      </div>
      <div className="tile-letter">
        {tile.letter}
      </div>
      <div className="tile-points">
        {tile.points}
      </div>
    </div>
  );
}
