const Tile = (props) => {
  return (
    <div 
      className={props.classname || 'tile'} 
      onMouseDown={() => props.grabTile(props.tile, props.key, true)} 
      key={props.key}
    >
    <div className='tile-text'>
      {props.tile.text}
    </div>
    <div className='tile-points'>
      {props.tile.points}
    </div>
  </div>
  );
}