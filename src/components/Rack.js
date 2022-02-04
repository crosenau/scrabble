import Tile from "./Tile";

export default function Rack({ tiles, grabTile, placeTile }) {
  const updatedTiles = [...tiles];
  const maxTiles = 7;

  while (updatedTiles.length < maxTiles) {
    updatedTiles.push(null);
  }

  return (
    <div className='rack'>
      {updatedTiles.map((tile, i) => {
        return tile ? (
          <Tile 
            clickHandler={grabTile}
            tile={tile}
            index={i}
            fromRack={true}
            key={i}
          />
        )
        : <div 
            className='rack-empty' 
            onClick={() => placeTile(i, true)}
            key={i}
          ></div>
      })}
    </div>
  );
}
