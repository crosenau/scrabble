import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import Tile from './Tile';

export default function Rack() {
  const { rack, grabTileFromRack, placeTileOnRack } = useContext(GameContext);
  const displayedTiles = [...rack];
  const maxTiles = 7;

  while (displayedTiles.length < maxTiles) {
    displayedTiles.push(null);
  }

  return (
    <div className="rack">
      {displayedTiles.map((tile, i) => {
        return tile ? (
          <Tile 
            tile={tile}
            index={i}
            clickHandler={(e) => grabTileFromRack(e, tile, i)}
            key={i}
          />
        )
        : <div 
            className="rack-empty" 
            onClick={() => placeTileOnRack(i)}
            key={i}
          ></div>
      })}
    </div>
  );
}
