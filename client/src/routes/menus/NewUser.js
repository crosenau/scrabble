import { useState, useContext } from 'react';
import GreenButton from '../../components/GreenButton';
import { UserContext } from '../../contexts/UserContext';
import { Navigate } from 'react-router-dom';
import './menus.scss'

export default function NewPlayer() {
  const { user, createUser } = useContext(UserContext);
  const [name, setName] = useState('');

  const handleChange = (event) => {
    setName(event.target.value);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    createUser(name);
  }

  const userIsCreated = user.id !== null;

  if (userIsCreated) {
    return <Navigate to="/mygames" />
  }

  return (
    <div className="menu">
      <form onSubmit={handleSubmit}>
        <div className="menu__options">
          <label htmlFor="name">User Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleChange}
          />
          <GreenButton label="Create User" type="submit" />
          <span>{user.error}</span>
        </div>

      </form>
    </div>
  );
}