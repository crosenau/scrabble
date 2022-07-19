import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import Tile from './Tile';
import './game.scss';

export default function Rack({ rack }) {

  return (
    <div className="rack">
      {rack.map((tile, i) => (
        <div 
          className="rack__cell"
          data-index={i}
          key={i}
        >
          {tile 
            ? <Tile tile={tile}/>
            : null
          }
          </div>
      ))}
    </div>
  );
}
