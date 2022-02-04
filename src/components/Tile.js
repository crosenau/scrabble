export default function Tile({ tile, className, style, clickHandler, fromRack, index }) {
  return (
    <div 
      className={className || 'tile'}
      style={style}
      onClick={(e) => clickHandler(e, tile, index, fromRack)}
      index={index}
    >
    <div className='tile-text'>
      {tile.text}
    </div>
    <div className='tile-points'>
      {tile.points}
    </div>
  </div>
  );
}
