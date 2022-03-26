import { useState, useContext } from 'react';
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
    <div id="player-form-container">
      <form onSubmit={handleSubmit}>
        <div className="field-container">
          <label htmlFor="name">Player Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleChange}
          />
        </div>
        <button
          className="button-submit"
          type="submit"
        >
          Enter
        </button>
        <span>{user.error}</span>
      </form>
    </div>
  );
}