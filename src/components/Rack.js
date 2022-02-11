import Tile from "./Tile";


export default function Rack({ rack, setRack, grabbedTile, setGrabbedTile }) {
  const updatedTiles = [...rack];
  const maxTiles = 7;

  while (updatedTiles.length < maxTiles) {
    updatedTiles.push(null);
  }

  const tileClickHandler = (e, tile, index) => {
    if (grabbedTile !== null) return;
    let updatedrack = [...rack];
    updatedrack[index] = null;
    setRack(updatedrack);
    setGrabbedTile({
      ...tile,
      letter: tile.points > 0 ? tile.letter : null,
      className: 'tile-grabbed',
      dragPosX: `${e.clientX - 20}px`,
      dragPosY: `${e.clientY - 20}px`,
    });
  }

  const rackClickHandler = (index) => {
    if (grabbedTile === null) return;
    let updatedrack = [...rack];
    updatedrack[index] = {
      ...grabbedTile,
      className: 'tile'
    };
    setRack(updatedrack);
    setGrabbedTile(null);
  }

  return (
    <div className='rack'>
      {updatedTiles.map((tile, i) => {
        return tile ? (
          <Tile 
            tile={tile}
            index={i}
            clickHandler={(e) => tileClickHandler(e, tile, i)}
            key={i}
          />
        )
        : <div 
            className='rack-empty' 
            onClick={() => rackClickHandler(i)}
            key={i}
          ></div>
      })}
    </div>
  );
}
