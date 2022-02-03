import Tile from "./Tile.js";

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
          <Tile 
            grabTile={props.grabTile}
            tile={tile}
            index={i}
            fromRack={true}
            key={i}
          />
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