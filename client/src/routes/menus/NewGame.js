import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../../contexts/GameContext';
import { UserContext } from '../../contexts/UserContext';
import GreenButton from '../../components/GreenButton';
import './menus.scss'

export default function Menu() {
  const { createGame } = useContext(GameContext);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [numPlayers, setNumPlayers] = useState(2);


  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleNumChange = (event) => {
    setNumPlayers(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (name !== '') {
      createGame(name, numPlayers);
      navigate('../game');
    }
  }

  return (
    <div className="menu">
      <form onSubmit={handleSubmit}>
        <div className="menu__options">
          <h1>New Game</h1>
          <label htmlFor="name">Game Name</label>
          <input
            id="name"
            type="text"
            maxLength="24"
            required={true}
            placeholder={`${user.name}'s game`}
            value={name}
            onChange={handleNameChange}
          ></input>
          <label htmlFor="players">Players</label>
          <input 
            id="players" 
            type="number" 
            min="1" 
            max="4"
            value={numPlayers}
            onChange={handleNumChange}
          />
          <GreenButton label="Start" type="submit" />
        </div>
      </form>
  </div>
  );
}