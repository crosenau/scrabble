import useFetch from '../../utils/useFetch';
import GameList from './GameList';

export default function BrowseGames() {
  const { data, isLoading, error } = useFetch('http://localhost:3001/games?players.userId=' + 'null');

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="menu">
      <GameList games={data} buttonLabel="Join" />
    </div>
  );
}