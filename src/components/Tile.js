const Tile = (props) => {
  return (
    <div 
      className={props.className || 'tile'}
      style={props.style}
      onMouseDown={() => props.grabTile(props.tile, props.position, props.fromRack)}
      position={props.position}
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

export default Tile;