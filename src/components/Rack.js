const Rack = (props) => {
  const tiles = [...props.tiles];
  const maxTiles = 7;

  while (tiles.length < maxTiles) {
    tiles.push(null);
  }

  return (
    <div className='rack'>
      {tiles.map((tile, i) => {
        return tile ? (
          <div 
            className='tile' 
            onMouseDown={() => props.grabTile(tile, i, true)} 
            key={i}
          >
            <div className='tile-text'>
              {tile.text}
            </div>
            <div className='tile-points'>
              {tile.points}
            </div>
          </div>
        )
        : <div 
            className='rack-empty' 
            onMouseUp={() => props.placeTile(i, true)}
            key={i}
          ></div>
      })}
    </div>
  );
}

export default Rack;