import Tile from './Tile.js';
import { getAllTiles } from '../../utils/gameUtils.js';

export default function LetterSelection({ selectLetter }) {
  const allTiles = getAllTiles();
  
  return (
    <div className="letter-selection-overlay">
      <div className="letter-selection">
        {allTiles.map((tile, i) => (
          <div 
            onPointerDown={() => selectLetter(tile.letter)}
            key={i}
          >
            <Tile
              tile={tile}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
