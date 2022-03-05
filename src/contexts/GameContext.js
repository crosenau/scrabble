import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserContext } from './UserContext';
import {
  get2dPos,
  createEmptyBoard,
  isValidPlacement,
  getPlayableWords,
  getPlacedTiles,
  addTilesToBoard
} from '../utils/boardUtils';
import { createTileBag, createTestBag, drawTiles } from '../utils/tileUtils';
import { isWord } from '../utils/dictionary';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';

export const GameContext = createContext();

export default function GameContextProvider(props) {
  const { user } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(false);
  const [grabbedTile, setGrabbedTile] = useState(null);
  const [letterSelectVisible, setLetterSelectVisible] = useState(false);
  const [uploadReady, setUploadReady] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [gameName, setGameName] = useState(null);
  const [board, setBoard] = useState(null);
  const [tileBag, setTileBag] = useState(null);
  const [turns, setTurns] = useState(0);
  const [players, setPlayers] = useState([]);

  const playerIndex = turns % players.length;

  useEffect(() => {
    console.log('useEffect')
    if (!uploadReady) return;
    async function checkThenUploadGame() {
      setIsLoading(true);
      let url, method;

      try {
        let gameExists = await isExistingGame(gameId);
        console.log('gameExists: ', gameExists)
        if (gameExists) {
          url = `http://localhost:3001/games/${gameId}`;
          method = 'PUT';
        } else {
          url = 'http://localhost:3001/games/'
          method = 'POST';
        }
        
        let status = await uploadGame(url, method);
        console.log('status ', status)
        if (status === 'success') {
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
    checkThenUploadGame();
    setUploadReady(false);
  }, [uploadReady])

  const createGame = (name, numPlayers) => {
    let tileBag = createTileBag();
    let players = [
      {
        userId: user.id,
        userName: user.name,
        tiles: tileBag.splice(0, 7),
        score: 0
      }
    ]

    for (let x = 1; x < numPlayers; x++) {
      players.push({
        userId: null,
        userName: '[Empty]',
        tiles: tileBag.splice(0, 7),
        score: 0
      });
    }

    const initialState = {
      name,
      id: uuidv4(),
      boardTiles: getPlacedTiles(createEmptyBoard()),
      tileBag,
      turns: 0,
      players
    };

    setGameState(initialState);
  };

  const setGameState = (game) => {
    if (!game.players.some(player => player.userId === user.id)) {
      const insertIndex = game.players.findIndex(player => player.userId === null);
      if (insertIndex === -1) {
        throw new Error('Game is full');
      }
      game.players[insertIndex] = {
        ...game.players[insertIndex],
        userId: user.id,
        userName: user.name,
      }
    }
    console.log(game)
    const newBoard = addTilesToBoard(game.boardTiles, createEmptyBoard());
    setBoard(newBoard);

    const player = game.players.filter(player => player.userId === user.id);
    console.log('thisPlayer: ', player);
    setTileBag(game.tileBag);
    setTurns(game.turns);
    setGameId(game.id);
    setGameName(game.name);
    setPlayers(game.players);
    if (game.turns < game.players.length) {
      setUploadReady(true);
      // possible race condition here
    }
  }

  const isExistingGame = async (id) => {
    try {
      let res = await fetch('http://localhost:3001/games?id=' + id);
      if (!res.ok) {
        throw new Error('Error checking game data')
      }
      let data = await res.json();
      if (data.length > 0) {
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  const uploadGame = async (url, method) => {    
    console.log('-----uploadGame-----');
    try {
      let res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gameName,
          id: gameId,
          boardTiles: getPlacedTiles(board),
          tileBag,
          turns,
          players
        })
      });

      if (!res.ok) {
        throw new Error('Error uploading game state')
      }
      return 'success';
    } catch (error) {
      throw error;
    }
  };

  const moveGrabbedTile = (event) => {
    if (!grabbedTile) return;
    const newGrabbedTile = { ...grabbedTile };
    newGrabbedTile.dragPosX = `${event.clientX - 20}px`;
    newGrabbedTile.dragPosY = `${event.clientY - 20}px`;
    setGrabbedTile(newGrabbedTile);
  };

  const selectLetter = (letter) => {
    const newboard = board;
    
    newboard.forEach(row => {
      row.forEach(square => {
        if (square.tile && square.tile.letter === null) {
          square.tile.letter = letter;
        }
      });
    });

    setBoard(newboard);
    setLetterSelectVisible(false);
  };

  const playWord = () => {
    let newBoard = cloneDeep(board);
    if (!isValidPlacement(board)) {
      alert('Invalid Move');
      newBoard = newBoard.map(row => {
        return row.map(square => {
          if (square.tile && !square.tile.played) {
            square.tile.className = 'tile-invalid';
          }
          return square;
        });
      })
      setBoard(newBoard);
      return;
    }

    const playedWords = getPlayableWords(board);
    if (playedWords.length === 0) {
      alert('no played words');
      newBoard = newBoard.map(row => {
        return row.map(square => {
          if (square.tile && !square.tile.played) {
            square.tile.className = 'tile-invalid';
          }
          return square;
        });
      })
      setBoard(newBoard);
      return;
    }

    const invalidWords = playedWords.reduce((prevWord, word) => {
      const text = word.map(square => square.tile.letter).join('');
      console.log(prevWord);
      console.log('isWord ', text, isWord(text));
      if (!isWord(text)) {
        return [...prevWord, word]
      }
      return prevWord;
    }, [])

    console.log('invalidWords: ', invalidWords);

    if (invalidWords.length > 0) {
      invalidWords.forEach(word => {
        const text = word.map(square => square.tile.letter).join('');
        const indices = word.map(square => square.index);
        alert(`${text} is not a valid word`);
        newBoard = newBoard.map(row => {
          return row.map(square => {
            if (square.tile && indices.includes(square.index)) {
              square.tile.className = 'tile-invalid';
            }
            return square;
          });
        })
        setBoard(newBoard);
      });
      return;
    }

    let playerScore = players[playerIndex].score;

    playedWords.forEach(word => {
      const indices = word.map(square => square.index);
      const score = scoreWord(word);
      newBoard = newBoard.map(row => {
        return row.map(square => {
          if (square.tile) {
            if (square.tile.className === 'tile-scored' && !indices.includes(square.index)) {
              square.tile.className = 'tile-played';
              square.tile.totalPoints = null;
            }
            if (indices.includes(square.index)) {
              square.tile.className = 'tile-scored';
              square.tile.played = true;
              square.tile.totalPoints = square.index === indices[indices.length-1]
              ? score
              : square.tile.totalPoints
            }
          }
          return square;
        });
      })

      playerScore += score;
    });

    let newPlayers = cloneDeep(players);
    let newTileBag = [...tileBag];
    newPlayers[playerIndex].score = playerScore;
    [newTileBag, newPlayers[playerIndex].tiles] = 
      drawTiles(newTileBag, newPlayers[playerIndex].tiles);

    setBoard(newBoard);
    setPlayers(newPlayers);
    setTurns(turns + 1);
    setTileBag(newTileBag);
    setUploadReady(true);
  };

  const scoreWord = (word) => {
    let wordScoreMod = 1;
    let score = 0;
    let playedTiles = 0;
    word.forEach(square => {
      if (square.letterScoreMod && !square.tile.played) {
        score += (square.tile.points * square.letterScoreMod);
      } else {
        score += square.tile.points;
      }
      if (square.wordScoreMod && !square.tile.played) {
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

  const grabTileFromRack = (event, tile, index) => {
    if (grabbedTile !== null) return;
    let newPlayers = cloneDeep(players);
    let rack = newPlayers.filter(player => player.userId === user.id)[0].tiles;
    rack[index] = null;
    setPlayers(newPlayers);
    setGrabbedTile({
      ...tile,
      letter: tile.points > 0 ? tile.letter : null,
      className: 'tile-grabbed',
      dragPosX: `${event.clientX - 20}px`,
      dragPosY: `${event.clientY - 20}px`,
    });
  }

  const placeTileOnRack = (index) => {
    if (grabbedTile === null) return;
    let newPlayers = cloneDeep(players);
    let rack = newPlayers.filter(player => player.userId === user.id)[0].tiles;
    rack[index] = {
      ...grabbedTile,
      className: 'tile'
    };
    setPlayers(newPlayers);
    setGrabbedTile(null);
  }

  const grabTileFromBoard = (event, tile, index) => {
    if (
      grabbedTile !== null 
      || tile.played === true
      || players[playerIndex].userId !== user.id
    ) return;
    const newBoard = cloneDeep(board).map(row => {
      return row.map(square => {
        if (square.tile && square.tile.className === 'tile-invalid') {
          square.tile.className = square.tile.played 
            ? 'tile-played'
            : 'tile'
        }
        return square;
      });
    })

    const pos2d = get2dPos(index);
    newBoard[pos2d[0]][pos2d[1]].tile = null;
    setBoard(newBoard);
    setGrabbedTile({
      ...tile,
      letter: tile.points > 0 ? tile.letter : null,
      className: 'tile-grabbed',
      grabbed: true,
      dragPosX: `${event.clientX - 20}px`,
      dragPosY: `${event.clientY - 20}px`,
    });
  }

  const placeTileOnBoard = (index) => {
    if (grabbedTile === null || players[playerIndex].userId !== user.id) return;
    let newBoard = cloneDeep(board);
    const pos2d = get2dPos(index);
    newBoard[pos2d[0]][pos2d[1]].tile = {
      ...grabbedTile,
      grabbed: false,
      className: 'tile'
    };
    newBoard = newBoard.map(row => {
      return row.map(square => {
        if (square.tile && square.tile.className === 'tile-invalid') {
          square.tile.className = square.tile.played 
            ? 'tile-played'
            : 'tile'
        }
        return square;
      });
    })
    setBoard(newBoard);
    if (grabbedTile.letter === null) {
      setLetterSelectVisible(true);
    }

    setGrabbedTile(null);
  }

  return (
    <GameContext.Provider value ={{
      isLoading,
      gameId,
      board,
      tileBag,
      grabbedTile,
      letterSelectVisible,
      players,
      turns,
      setGameState,
      createGame,
      grabTileFromRack,
      placeTileOnRack,
      grabTileFromBoard,
      placeTileOnBoard,
      moveGrabbedTile,
      selectLetter,
      playWord,
    }}>
      {props.children}
    </GameContext.Provider>
  );
}