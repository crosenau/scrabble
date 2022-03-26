import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SocketContext } from './SocketContext';

export const UserContext = createContext();

export default function UserContextProvider(props) {
  const { putUser, isOnline } = useContext(SocketContext);

  const [user, setUser] = useState(() => {
    const localData = localStorage.getItem('scrabbleUser');
    return localData ? JSON.parse(localData) : {
      id: null,
      name: null,
    }
  });

  useEffect(() => {
    if (user.id && isOnline) {
      localStorage.setItem('scrabbleUser', JSON.stringify({
        id: user.id,
        name: user.name
      }));

      putUser(user);
    }
  }, [user, isOnline]);

  const createUser = (name) => {
    setUser({
      ...user,
      name,
      id: uuidv4()
    })
  }

  return (
    <UserContext.Provider value={{ user, createUser }}>
      {props.children}
    </UserContext.Provider>
  );
}
