import { useState } from 'react';
import Board from './Board.js';
import Rack from './Rack.js';
import Tile from './Tile.js';

import { createEmptyBoard, get2dPos } from '../utils/boardUtils.js';
import createTileBag from '../utils/bagUtils.js';
import { isWord }from '../utils/dictionary.js'

const Game = () => {
  const [ gameBoard, setGameBoard ] = useState(createEmptyBoard());
  const [ tileBag, setTileBag ] = useState(createTileBag());
  const [ playerTiles, setPlayerTiles ] = useState([]);
  const [ grabbedTile, setGrabbedTile ] = useState(null);

  const drawTiles = () => {
    const numTiles = 7 - playerTiles.length;
    setPlayerTiles([...playerTiles].concat(tileBag.slice(0, numTiles)));
    setTileBag([...tileBag].slice(numTiles));
  }

  const grabTile = (tile, index, fromRack) => {
    setGrabbedTile({
      tile,
      index,
      fromRack,
      dragPosX: '',
      dragPosY: ''
    });
  }

  const moveGrabbedTile = (x, y) => {
    if (!grabbedTile) return;
    const updatedGrabbedTile = {...grabbedTile};
    updatedGrabbedTile.dragPosX = `${x - 20}px`;
    updatedGrabbedTile.dragPosY = `${y - 20}px`;
    setGrabbedTile(updatedGrabbedTile);
  }

  const placeTile = (index, onRack) => {
    if (grabbedTile === null) return;

    const updatedPlayerTiles = [...playerTiles];
    const updatedBoard = JSON.parse(JSON.stringify(gameBoard));
    
    if (onRack) {
      updatedPlayerTiles[index] = grabbedTile.tile;
    } else {
      const pos2d = get2dPos(index);
      updatedBoard[pos2d[0]][pos2d[1]].tile = grabbedTile.tile;
    }

    if (grabbedTile.fromRack) {
      updatedPlayerTiles[grabbedTile.index] = null;
    } else {
      const pos2d = get2dPos(grabbedTile.index);
      updatedBoard[pos2d[0]][pos2d[1]].tile = null;
    }

    setPlayerTiles(updatedPlayerTiles);
    setGameBoard(updatedBoard);
    setGrabbedTile(null);
  }

  const playWord = () => {
    if (!isValidPlacement()) {
      alert('Invalid Move');
      // hightlight invalid tiles
      return;
    }

    const playedWords = getPlayedWords();
    console.log(playedWords)

    if (playedWords.length === 0) {
      alert('invalid word');
      // hightlight invalid word
    }

    for (let word of playedWords) {
      let text = '';
      for (let square of word) {
        text += square.tile.text
      }
      console.log(isWord(text));
      if (isWord(text) === false) {
        alert(`${text} is not a valid word`);
        // highlight invalid word
      } else {
        const score = scoreWord(word);
        console.log(`${text} played for ${score} points.`);
      }
    }

  }

  const isValidPlacement = () => {
    console.log('isValidPlacement');
    if (!gameBoard[7][7].tile) {
      console.log('Center square is not filled');
      return false;
    }

    const playedTileIndices = [];

    for (let row of gameBoard) {
      for (let square of row) {
        if (square.tile && !square.tile.played) {
          playedTileIndices.push(square.index);
        }
      }
    }

    const validGaps = [1, 15];
    let previousGap = null;

    for (let x = 1; x < playedTileIndices.length; x++) {
      if (!previousGap) {
        if (!validGaps.includes(playedTileIndices[x] - playedTileIndices[x-1])) {
          console.log('initial difference invalid')
          return false;
        }
      } else if (
          previousGap 
          && playedTileIndices[x] - playedTileIndices[x-1] !== previousGap
        ) {
        console.log('mismatched differences')
        return false;
      }
      previousGap = playedTileIndices[x] - playedTileIndices[x-1];

    }

    return true;
  }

  /**
   * Return all rows and columns containing multiple tiles with at least one that is unplayed.
   * @returns [Array]
   */
  const getPlayedWords = () => {
    console.log('getPlayedWords')
    const extractPlayedWords = (line) => {
      const words = [];
      let potentialWord = [];
      let containsUnplayedTile = false;

      for (let square of line) {
        if (square.tile === null) {
          if (potentialWord.length > 1 && containsUnplayedTile) {
            words.push(potentialWord);
          }
          potentialWord = [];
          containsUnplayedTile = false;
        } else if (square.tile !== null) {
          if (!square.tile.played) {
            containsUnplayedTile = true;
          }
          potentialWord.push(square);
        }
      }

      return words;
    }

    const playableWords = [];

    for (let row of gameBoard) {
      const words = extractPlayedWords(row);
      if (words.length > 0) {
        playableWords.push(words.flat());
      }
    }

    const transposedBoard = gameBoard[0].map((_, colIndex) => {
      return gameBoard.map((row) => row[colIndex]) 
    });

    for (let row of transposedBoard) {
      const words = extractPlayedWords(row);
      if (words.length > 0) {
        playableWords.push(words.flat());
      }
    }

    return playableWords;
  }

  const scoreWord = (word) => {
    let wordScoreMod = 1;
    let score = 0;
    let playerTiles = 0;

    for (let square of word) {
      if (square.letterScoreMod) {
        score += (square.tile.points * square.letterScoreMod);
      } else {
        score += square.tile.points;
      }

      if (square.wordScoreMod) {
        wordScoreMod = square.wordScoreMod;
      }

      if (!square.tile.played) {
        playerTiles += 1;
      }
    }

    score *= wordScoreMod;
    score += (playerTiles === 7) ? 50 : 0;
    return score;
  }

  return (
    <div 
      className='game'
      onMouseMove={(e) => {
        moveGrabbedTile(e.clientX, e.clientY);
      }}
    >
      <Board gameBoard={gameBoard} placeTile={placeTile} grabTile={grabTile}/>
      <Rack tiles={playerTiles} placeTile={placeTile} grabTile={grabTile}/>
      { grabbedTile ? 
        <Tile 
          className='tile-grabbed'
          tile={grabbedTile.tile} 
          style={{top:grabbedTile.dragPosY, left:grabbedTile.dragPosX}} 
        />
      : null }
      <button onClick={e => drawTiles()}>Start Game</button>
      <button onClick={e => playWord()}>Play</button>
    </div>
  )
};

export default Game;