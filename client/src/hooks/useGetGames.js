import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../contexts/SocketContext';

export default function useGetGames(filter) {
  const { isOnline, getGames } = useContext(SocketContext);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getGameList = async () => {
      try {
        if (isOnline) {
          const games = await getGames(filter);

          
        }
      } catch(err) {
        console.log(err);
      }
    }
  })
}