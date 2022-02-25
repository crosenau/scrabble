import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

export default function PrivateRoute({ component: Component }) {
  const { user } = useContext(UserContext);
  const playerIsCreated = user.id !== null;

  if (playerIsCreated) {
    return <Component />
  }

  return <Navigate to="/" />
}