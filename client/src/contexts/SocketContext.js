import React, { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export default function SocketContextProvider(props) {
  console.log('SocketContextProvider');
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [myGames, setMyGames] = useState(null);
  const [publicGames, setPublicGames] = useState(null);
  const [gameState, setGameState] = useState(null);
  
  useEffect(() => {
    const newSocket = io('http://localhost:3001');

    newSocket.on('connect', () => {
      console.log('client connected');
      setIsOnline(newSocket.connected);
    });

    newSocket.on('disconnect', () => {
      console.log('client disconnected')
      setIsOnline(newSocket.connected);
    });

    newSocket.on('gameState', data => {
      console.log('gameState received');
      setGameState(data);
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

  const putGame = (gameState) => {
    try {
      socket.emit('putGame', gameState, (ack) => {
        if (ack !== 'ok') {
          throw new Error('Error creating new game');
        }
      })
    } catch(err) {
      console.log(err);
    }
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
      gameState,
      putUser,
      putGame,
      getMyGames,
      setMyGames,
      getPublicGames,
      setPublicGames,
    }}>
      {props.children}
    </SocketContext.Provider>
  )
}