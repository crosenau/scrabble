import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { GameContext } from '../../contexts/GameContext';
import GameList from './GameList';
import useFetch from '../../utils/useFetch'; 

export default function MyGames() {
  const { user } = useContext(UserContext);
  const { data, isLoading, error } = useFetch('http://localhost:3001/games?players.userId=' + user.id);

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="menu">
      <GameList games={data} />
    </div>
  );
}