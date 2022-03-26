import { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { SocketContext } from '../../contexts/SocketContext';
import GameList from './GameList';
import './menus.scss'

export default function MyGames() {
  const { user } = useContext(UserContext);
  const { isOnline, myGames, getMyGames, setMyGames } = useContext(SocketContext);
  
  useEffect(() => {
    console.log('myGames useEffect');
    if (isOnline && !myGames) {
      getMyGames(user.id);
    }
    return () => setMyGames(null);
  }, [isOnline])

  if (!myGames || myGames.length < 1) {
    return <div>You have no games</div>
  }

  return (
    <div className="menu">
      <GameList games={myGames} buttonLabel="Resume" />
    </div>
  );
}