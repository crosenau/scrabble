import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export default function SocketContextProvider(props) {
  console.log('SocketContextProvider');
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [myGames, setMyGames] = useState(null);
  const [publicGames, setPublicGames] = useState(null);
  const [gameData, setGameData] = useState(null);
  
  useEffect(() => {
    const newSocket = io('//:3001');

    newSocket.on('connect', () => {
      console.log('client connected');
      setIsOnline(newSocket.connected);
    });

    newSocket.on('disconnect', () => {
      console.log('client disconnected')
      setIsOnline(newSocket.connected);
    });

    newSocket.on('gameData', data => {
      console.log('gameData received');
      setGameData(data);
    });

    newSocket.on('myGames', gameList => {
      setMyGames(gameList);
    });

    newSocket.on('publicGames', gameList => {
      setPublicGames(gameList);
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);
  
  const putUser = (user) => {
    console.log('emitting putUser')
    try {
      socket.emit('putUser', { user }, (ack) => {
        if (ack !== 'ok') {
          throw new Error('Error syncing user');
        }
      });
    } catch(err) {
      console.log(err);
    }
  }

  const putGame = (gameData) => {
    try {
      socket.emit('putGame', gameData, (ack) => {
        if (ack !== 'ok') {
          throw new Error('Error creating new game');
        }
      })
    } catch(err) {
      console.log(err);
    }
  }

  const getGame = (gameId) => {
    socket.emit('getGame', gameId);
  }

  const getMyGames = (userId) => {
    socket.emit('getMyGames', userId);
  }

  const getPublicGames = (userId) => {
    socket.emit('getPublicGames', userId);
  }

  return (
    <SocketContext.Provider value={{ 
      isOnline,
      myGames,
      publicGames,
      gameData,
      putUser,
      putGame,
      getGame,
      getMyGames,
      setMyGames,
      getPublicGames,
      setPublicGames,
    }}>
      {props.children}
    </SocketContext.Provider>
  )
}