import { useState } from 'react';
import Board from './Board';
import Rack from './Rack';
import Tile from './Tile';

import { createEmptyBoard, get2dPos } from '../utils/boardUtils';
import { getTileBag, getLetterSelection, getTestBag } from '../utils/bagUtils';
import { isWord } from '../utils/dictionary';
import LetterSelection from './LetterSelection';

export default function Game() {
  const [gameBoard, setGameBoard] = useState(createEmptyBoard());
  const [tileBag, setTileBag] = useState(getTestBag());
  const [playerTiles, setPlayerTiles] = useState([]);
  const [grabbedTile, setGrabbedTile] = useState(null);
  const [letterSelectVisible, setLetterSelectVisible] = useState(false);
  const [letterSelection, setLetterSelection] = useState(getLetterSelection());

  const drawTiles = () => {
    const numTiles = 7 - playerTiles.length;
    setPlayerTiles([...playerTiles].concat(tileBag.slice(0, numTiles)));
    setTileBag([...tileBag].slice(numTiles));
  };

  const grabTile = (event, tile, fromIndex, fromRack) => {
    const updatedPlayerTiles = [...playerTiles];
    const updatedBoard = JSON.parse(JSON.stringify(gameBoard));
    if (fromRack) {
      updatedPlayerTiles[fromIndex] = null;
    } else {
      const pos2d = get2dPos(fromIndex);
      updatedBoard[pos2d[0]][pos2d[1]].tile = null;
    }
    
    setGrabbedTile({
      ...tile,
      text: tile.points > 0 ? tile.text : null,
      dragPosX: `${event.clientX - 20}px`,
      dragPosY: `${event.clientY - 20}px`,
    });
    
    setPlayerTiles(updatedPlayerTiles);
    setGameBoard(updatedBoard);
    console.log('finished')
  };

  const moveGrabbedTile = (event) => {
    if (!grabbedTile) return;
    const updatedGrabbedTile = { ...grabbedTile };
    updatedGrabbedTile.dragPosX = `${event.clientX - 20}px`;
    updatedGrabbedTile.dragPosY = `${event.clientY - 20}px`;
    setGrabbedTile(updatedGrabbedTile);
  };

  const placeTile = (toIndex, onRack) => {
    if (grabbedTile === null) return;  
    const updatedPlayerTiles = [...playerTiles];
    const updatedBoard = JSON.parse(JSON.stringify(gameBoard));

    // Place Tile at new position
    if (onRack) {
      updatedPlayerTiles[toIndex] = grabbedTile;
    } else {
      const pos2d = get2dPos(toIndex);
      updatedBoard[pos2d[0]][pos2d[1]].tile = grabbedTile;
    }
    setPlayerTiles(updatedPlayerTiles);
    setGameBoard(updatedBoard);
    setGrabbedTile(null);
    if (!onRack && grabbedTile.text === null) {
      console.log('adding toIndex to grabbedTile')
      setLetterSelectVisible(true);
    }
  }

  const selectLetter = (letter) => {
    console.log('setLetter');
    const updatedGameBoard = gameBoard;
    
    updatedGameBoard.forEach((row) => {
      row.forEach((square) => {
        if (square.tile && square.tile.text === null) {
          square.tile.text = letter;
        }
      });
    });

    setGameBoard(updatedGameBoard);
    setLetterSelectVisible(false);
  };

  const playWord = () => {
    if (!isValidPlacement()) {
      alert('Invalid Move');
      // hightlight invalid tiles
      return;
    }
    const playedWords = getPlayedWords();
    if (playedWords.length === 0) {
      alert('invalid word');
      // hightlight invalid word
    }
    playedWords.forEach((word) => {
      let text = '';
      word.forEach((square) => {
        text += square.tile.text;
      });
      console.log(isWord(text));
      if (isWord(text) === false) {
        alert(`${text} is not a valid word`);
        // highlight invalid word
      } else {
        const score = scoreWord(word);
        console.log(`${text} played for ${score} points.`);
      }
    });
  };

  const isValidPlacement = () => {
    console.log('isValidPlacement');
    if (!gameBoard[7][7].tile) {
      console.log('Center square is not filled');
      return false;
    }
    const playedTileIndices = [];
    gameBoard.forEach((row) => {
      row.forEach((square) => {
        if (square.tile && !square.tile.played) {
          playedTileIndices.push(square.index);
        }
      });
    });
    const validGaps = [1, 15];
    let previousGap = null;
    for (let x = 1; x < playedTileIndices.length; x += 1) {
      if (!previousGap) {
        if (!validGaps.includes(playedTileIndices[x] - playedTileIndices[x-1])) {
          console.log('initial difference invalid');
          return false;
        }
      } else if (
        previousGap
        && playedTileIndices[x] - playedTileIndices[x - 1] !== previousGap
      ) {
        console.log('mismatched differences');
        return false;
      }
      previousGap = playedTileIndices[x] - playedTileIndices[x - 1];
    }
    return true;
  };

  /**
   * Return all rows and columns containing multiple tiles with at least one that is unplayed.
   * @returns [Array]
   */
  const getPlayedWords = () => {
    console.log('getPlayedWords');
    const extractPlayedWords = (line) => {
      const words = [];
      let potentialWord = [];
      let containsUnplayedTile = false;

      line.forEach((square) => {
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
      });
      return words;
    };

    const playableWords = [];
    gameBoard.forEach((row) => {
      const words = extractPlayedWords(row);
      if (words.length > 0) {
        playableWords.push(words.flat());
      }
    });
    const transposedBoard = gameBoard[0].map((_, colIndex) => (
      gameBoard.map((row) => row[colIndex])));
    transposedBoard.forEach((row) => {
      const words = extractPlayedWords(row);
      if (words.length > 0) {
        playableWords.push(words.flat());
      }
    });
    return playableWords;
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
    <div
      className="game"
      onMouseMove={(e) => moveGrabbedTile(e)}
    >
      <Board
        gameBoard={gameBoard}
        placeTile={placeTile}
        grabTile={grabTile}
      />
      <Rack tiles={playerTiles} placeTile={placeTile} grabTile={grabTile}/>
      { grabbedTile ? (
        <Tile
          className="tile-grabbed"
          tile={grabbedTile}
          style={{ top:grabbedTile.dragPosY, left:grabbedTile.dragPosX }}
        />
      )
        : null }
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
