import { useContext } from 'react';
import Tile from './Tile.js';
import { getAllTiles } from '../../utils/gameUtils.js';
import { GameContext } from '../../contexts/GameContext.js';

export default function LetterSelection() {
  const { selectLetter } = useContext(GameContext);

  const allTiles = getAllTiles();
  return (
    <div className="letter-selection-overlay">
      <div className="letter-selection">
        {allTiles.map((tile, i) => (
          <Tile
            tile={tile}
            handlePointerDown={() => selectLetter(tile.letter)}
            key={i}
          />
        ))}
      </div>
    </div>
  );
}
