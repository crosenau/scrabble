import { useState } from 'react';
import Board from './Board';
import Rack from './Rack';
import Tile from './Tile';

import {
  createEmptyBoard,
  isValidPlacement,
  getPlayableWords,
  editBoardByFilter,
  editBoardByIndices
} from '../utils/boardUtils';
import { getTileBag, getAllLetters, getTestBag } from '../utils/bagUtils';
import { isWord } from '../utils/dictionary';
import LetterSelection from './LetterSelection';

export default function Game() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [tileBag, setTileBag] = useState(getTestBag());
  const [rack, setRack] = useState([]);
  const [grabbedTile, setGrabbedTile] = useState(null);
  const [letterSelectVisible, setLetterSelectVisible] = useState(false);
  const [letterSelection, setLetterSelection] = useState(getAllLetters());

  const drawTiles = () => {
    const numTiles = 7 - rack.length;
    setRack([...rack].concat(tileBag.slice(0, numTiles)));
    setTileBag([...tileBag].slice(numTiles));
  };

  const moveGrabbedTile = (event) => {
    if (!grabbedTile) return;
    const updatedGrabbedTile = { ...grabbedTile };
    updatedGrabbedTile.dragPosX = `${event.clientX - 20}px`;
    updatedGrabbedTile.dragPosY = `${event.clientY - 20}px`;
    setGrabbedTile(updatedGrabbedTile);
  };

  const selectLetter = (letter) => {
    const updatedboard = board;
    
    updatedboard.forEach((row) => {
      row.forEach((square) => {
        if (square.tile && square.tile.letter === null) {
          square.tile.letter = letter;
        }
      });
    });

    setBoard(updatedboard);
    setLetterSelectVisible(false);
  };

  const playWord = () => {
    let updatedBoard = JSON.parse(JSON.stringify(board));
    if (!isValidPlacement(board)) {
      alert('Invalid Move');
      editBoardByFilter(
        updatedBoard,
        (square) => square.tile && !square.tile.played,
        (square) => square.tile.className = 'tile-invalid'
      );
      setBoard(updatedBoard);
      return;
    }

    const playedWords = getPlayableWords(board);
    if (playedWords.length === 0) {
      alert('no played words');
      editBoardByFilter(
        updatedBoard,
        (square) => square.tile && !square.tile.played,
        (square) => square.tile.className = 'tile-invalid'
      );
      setBoard(updatedBoard);
      return;
    }

    playedWords.forEach((word) => {
      let text = '';
      word.forEach((square) => {
        text += square.tile.letter;
      });
      const indices = word.map(square => square.index);
      console.log(isWord(text));
      if (isWord(text) === false) {
        alert(`${text} is not a valid word`);
        editBoardByFilter(
          updatedBoard,
          (square) => square.tile && indices.includes(square.index),
          (square) => square.tile.className = 'tile-invalid'
        );
        setBoard(updatedBoard);
        return;
      } else {
        const score = scoreWord(word);
        editBoardByIndices(
          updatedBoard, 
          indices, 
          (square) => square.tile.className = 'tile-scored'
        );
        editBoardByIndices(
          updatedBoard,
          indices[indices.length-1],
          (square) => square.tile.totalPoints = score
        )
        setBoard(updatedBoard);
        console.log(`${text} played for ${score} points.`);
      }
    });
  };

  const scoreWord = (word) => {
    let wordScoreMod = 1;
    let score = 0;
    let playedTiles = 0;
    word.forEach((square) => {
      if (square.letterScoreMod) {
        score += (square.tile.points * square.letterScoreMod);
      } else {
        score += square.tile.points;
      }
      if (square.wordScoreMod) {
        wordScoreMod = square.wordScoreMod;
      }
      if (!square.tile.played) {
        playedTiles += 1;
      }
    });

    score *= wordScoreMod;
    score += (playedTiles === 7) ? 50 : 0;
    return score;
  };

  return (
    <div className="game" onMouseMove={(e) => moveGrabbedTile(e)}>
      <Board
        board={board}
        setBoard={setBoard}
        grabbedTile={grabbedTile} 
        setGrabbedTile={setGrabbedTile}
        setLetterSelectVisible={setLetterSelectVisible}
      />
      <Rack 
        rack={rack} 
        setRack={setRack} 
        grabbedTile={grabbedTile} 
        setGrabbedTile={setGrabbedTile}
      />
      { grabbedTile ? (
        <Tile
          tile={grabbedTile}
          style={{ top:grabbedTile.dragPosY, left:grabbedTile.dragPosX }}
        />
      ) : null }
      <button type="button" onClick={() => drawTiles()}>Start Game</button>
      <button type="button" onClick={() => playWord()}>Play</button>
      { letterSelectVisible ? (
        <LetterSelection
          tiles={letterSelection}
          selectLetter={selectLetter}
        />
      ) : null }
    </div>
  );
}
