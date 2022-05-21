import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { UserContext } from '../../contexts/UserContext';
import { SocketContext } from '../../contexts/SocketContext';
import { createTileBag, createTestBag } from '../../utils/gameUtils';
import GreenButton from '../../components/GreenButton';
import './menus.scss'

export default function Menu() {
  const { user } = useContext(UserContext);
  const { putGame } = useContext(SocketContext);
  const navigate = useNavigate();  
  const [name, setName] = useState('');
  const [numPlayers, setNumPlayers] = useState(2);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleNumChange = (event) => {
    setNumPlayers(event.target.value);
  };

  const createGame = (name, numPlayers) => {
    let tileBag = createTileBag();
    let players = [
      {
        userId: user.id,
        userName: user.name,
        tiles: tileBag.splice(0, 7),
        score: 0
      }
    ];

    for (let x = 1; x < numPlayers; x++) {
      players.push({
        userId: null,
        userName: '',
        tiles: tileBag.splice(0, 7),
        score: 0
      });
    }

    const game = {
      name,
      id: uuidv4(),
      boardTiles: [],
      tileBag,
      turns: 0,
      players,
      gameOver: false
    };

    return game;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (name !== '') {
      const newGame = createGame(name, numPlayers);
      
      putGame(newGame);
      navigate(`../game/${newGame.id}`);
    }
  };

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