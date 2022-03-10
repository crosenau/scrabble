import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const UserContext = createContext();

export default function UserContextProvider(props) {
  const [user, setUser] = useState(() => {
    const localData = localStorage.getItem('scrabbleUser');
    return localData ? JSON.parse(localData) : {
      id: null,
      name: null,
    }
  });

  useEffect(() => {
    localStorage.setItem('scrabbleUser', JSON.stringify({
      id: user.id,
      name: user.name
    }));
    if (user.id) {
      saveUser(user);
    }
  }, [user]);

  const createUser = (name) => {
    setUser({
      ...user,
      name,
      id: uuidv4()
    })
  }

  const saveUser = async (user) => {
    const existingPlayers = await fetch(`http://localhost:3001/users?id=${user.id}`)
      .then(res => {
        if (!res.ok) {
          throw Error ('could not verify if player exists');
        }
        return res.json();
      })
      .catch((error) => {
        console.log(error);
      });

      const path = existingPlayers[0] ? user.id : '';
      const method = existingPlayers[0] ? 'PUT' : 'POST';
      const body = {
        name: user.name,
        lastActivity: Date.now()
      };

      if (!existingPlayers[0]) {
        body.id = user.id
      }

      fetch(`http://localhost:3001/users/${path}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      .then((res) => {
        if (!res.ok) {
          throw Error ('could not save player');
        }
        return res.json();
      })
      .catch((error) => {
        if (user.error !== error.message) {
          setUser({
            ...user,
            error: error.message
          })
        }
      });
  }

  return (
    <UserContext.Provider value={{ user, createUser, saveUser }}>
      {props.children}
    </UserContext.Provider>
  );
}
