import { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { SocketContext } from '../../contexts/SocketContext';
import GameList from './GameList';
import './menus.scss'

export default function PublicGames() {
  const { user } = useContext(UserContext);
  const { isOnline, publicGames, getPublicGames, setPublicGames } = useContext(SocketContext);
  
  useEffect(() => {
    console.log('BrowseGames useEffect');
    if (isOnline && !publicGames) {
      getPublicGames(user.id);
    }
    return () => setPublicGames(null);
  }, [isOnline])

  return (
    <div className="menu">
      {(!publicGames || publicGames.length < 1)
        ? <div className="menu__message">There are no open public games.</div> 
      : <GameList games={publicGames} buttonLabel="Join" />
      }
    </div>
  );
}