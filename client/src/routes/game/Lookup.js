import { useState } from 'react';
import GreenButton from '../../components/GreenButton.js';
import { isWord } from '../../utils/gameUtils.js';
import './game.scss';

export default function Lookup() {
  const [word, setWord] = useState('');
  const [isValid, setIsValid] = useState(null);

  const handleWordChange = (event) => {
    const pattern = /[^A-Za-z]/g;
    const newWord = event.target.value.replace(pattern, '');

    setWord(newWord);
    setIsValid(null);
  };

  const lookupWord = (event) => {
    event.preventDefault();
    setIsValid(isWord(word));
  }

  return (
    <div className="game__lookup">
      <form onSubmit={lookupWord}>
        <input 
          type="text" 
          placeholder="Enter a word"
          value={word}
          onChange={handleWordChange}
          pattern="^[A-Za-z]+$"
          maxLength="15"
          style={{
            color: isValid === true 
              ? 'green'
              : isValid === false 
              ? 'red'
              : 'black'
            
          }}
        > 
        </input>
        <GreenButton label="Lookup" type="submit" />
      </form>
    </div>
  );
}
