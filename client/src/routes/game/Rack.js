import { useContext } from 'react';
import { GameContext } from '../../contexts/GameContext';
import { UserContext } from '../../contexts/UserContext';
import Tile from './Tile';
import './rack.scss';

export default function Rack() {
  const { players } = useContext(GameContext);
  const { user } = useContext(UserContext);
  const tiles = players.filter(player => player.userId === user.id)[0].tiles;
  const numTiles = 7;

  while (tiles.length < numTiles) {
    console.log('Rack: filling in blank tiles');
    tiles.push(null);
  }

  return (
    <div className="rack-container">
      <div className="rack">
        {tiles.map((tile, i) => (
          <div 
            className="rack__cell"
            data-index={i}
            style={{ transform: 'scale(1.2)' }}
            key={i}
          >
            {tile 
              ? <Tile tile={tile}/>
              : null
            }
            </div>
        ))}
      </div>
    </div>
  );
}
