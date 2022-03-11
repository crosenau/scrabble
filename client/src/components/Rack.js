import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import { UserContext } from '../contexts/UserContext';
import Tile from './Tile';

export default function Rack() {
  const {
    players,
    grabTileFromRack,
    placeTileOnRack,
    isTradingTiles,
    selectTile
  } = useContext(GameContext);
  const { user } = useContext(UserContext);
  const tiles = players.filter(player => player.userId === user.id)[0].tiles;
  const maxTiles = 7;

  while (tiles.length < maxTiles) {
    console.log('Rack: filling in blank tiles');
    tiles.push(null);
  }

  return (
    <div className="rack">
      {tiles.map((tile, i) => {
        return tile ? (
          <Tile 
            tile={tile}
            index={i}
            clickHandler={isTradingTiles ? selectTile : grabTileFromRack}
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
