import Tile from './Tile.js';

export default function LetterSelection({ tiles, selectLetter }) {
  return (
    <div className='letter-selection-overlay'>
      <div className='letter-selection'>
        {tiles.map((tile, i) => (
          <Tile
            tile={tile}
            clickHandler={() => selectLetter(tile.letter)}
            key={i}
          />
        ))}
      </div>
    </div>
  );
}
