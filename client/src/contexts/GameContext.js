import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserContext } from './UserContext';
import {
  get2dPos,
  createEmptyBoard,
  isValidPlacement,
  getPlayableWords,
  getPlacedTiles,
  addTilesToBoard,
  createTileBag,
  drawTiles,
  recallTilesFromBoard
} from '../utils/gameUtils';
import { isWord } from '../utils/dictionary';
import { NEW_GAME, UPDATE_GAME, JOIN_GAME } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { clone, cloneDeep, shuffle } from 'lodash';
import { io } from 'socket.io-client';

export const GameContext = createContext();

export default function GameContextProvider(props) {
  const { user } = useContext(UserContext);

  const [grabbedTile, setGrabbedTile] = useState(null);
  const [letterSelectVisible, setLetterSelectVisible] = useState(false);
  const [isTradingTiles, setIsTradingTiles] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [gameName, setGameName] = useState(null);
  const [board, setBoard] = useState(null);
  const [tileBag, setTileBag] = useState(null);
  const [turns, setTurns] = useState(0);
  const [players, setPlayers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [uploadType, setUploadType] = useState(null);
  const [roomId, setRoomId] = useState(null);
  
  const playerIndex = turns % players.length;

  useEffect(() => {
    console.log('useEffect - socket');
    const newSocket = io('http://localhost:3001');

    newSocket.on('gameState', (data) => {
      console.log('socketData: ', data);
      setGameState(data, false);

    })
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    console.log('useEffect - uploadType');
    if (!uploadType) return;

    const gameState = {
      name: gameName,
      id: gameId,
      boardTiles: getPlacedTiles(board),
      tileBag,
      turns,
      players
    };

    try {
      socket.emit(uploadType, { gameState }, (ack) => {
        if (!ack.success) {
          throw new Error('Error setting gameState');
        }
        if (roomId !== gameId) {
          socket.emit(JOIN_GAME, { gameId }, (ack) => {
            if (!ack.success) {
              throw new Error('Error joining room');
            }
            setRoomId(ack.roomId);
          });
        }
        setUploadType(null);
      })
    } catch(error) {
      console.log(error);
    }
  }, [uploadType]);

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

    setGameState(initialState, NEW_GAME);
  };

  const setGameState = (game, nextAction = null) => {
    console.log('setGameState');
    try {
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
      const newBoard = addTilesToBoard(game.boardTiles, createEmptyBoard());
      setBoard(newBoard);
  
      const player = game.players.filter(player => player.userId === user.id);
      setTileBag(game.tileBag);
      setTurns(game.turns);
      setGameId(game.id);
      setGameName(game.name);
      setPlayers(game.players);
      setLetterSelectVisible(false);
      setIsTradingTiles(false);
      if (nextAction) {
        setUploadType(nextAction);
      }
    } catch(error) {
      console.log(error);
    }
  }

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
    drawTiles(newTileBag, newPlayers[playerIndex].tiles);

    setBoard(newBoard);
    setPlayers(newPlayers);
    setTurns(turns + 1);
    setTileBag(newTileBag);
    setUploadType(UPDATE_GAME);
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

  const selectTile = (e, tile, index) => {
    const newPlayers = cloneDeep(players);
    const tiles = newPlayers[playerIndex].tiles;
    tiles[index].className = tile.className === 'tile-selected'
      ? 'tile'
      : 'tile-selected'

    setPlayers(newPlayers);
  }

  const recallTiles = () => {
    if (players[playerIndex].userId !== user.id) return;
    
    const newBoard = cloneDeep(board);
    const newPlayers = cloneDeep(players);
    const playerTiles = newPlayers[playerIndex].tiles;

    recallTilesFromBoard(newBoard, playerTiles);
    playerTiles.forEach(tile => tile.className = 'tile');
    setBoard(newBoard);
    setPlayers(newPlayers);
  }

  const skipTurn = () => {
    if (players[playerIndex].userId !== user.id) return;

    const newBoard = cloneDeep(board);
    const newPlayers = cloneDeep(players);
    const playerTiles = newPlayers[playerIndex].tiles;

    recallTilesFromBoard(newBoard, playerTiles);
    playerTiles.forEach(tile => tile.className = 'tile');
    setBoard(newBoard);
    setPlayers(newPlayers);
    setTurns(turns + 1);
    setUploadType(UPDATE_GAME);
  }

  const shuffleTiles = () => {
    const shuffleIndex = players.findIndex(player => player.userId === user.id);
    const newPlayers = cloneDeep(players);
    newPlayers[shuffleIndex].tiles = shuffle(newPlayers[shuffleIndex].tiles);

    setPlayers(newPlayers);
  }

  const toggleIsTradingTiles = () => {
    if (players[playerIndex].userId !== user.id) return;

    const newBoard = cloneDeep(board);
    const newPlayers = cloneDeep(players);
    const playerTiles = newPlayers[playerIndex].tiles;

    recallTilesFromBoard(newBoard, playerTiles);
    playerTiles.forEach(tile => tile.className = 'tile');
    setBoard(newBoard);
    setPlayers(newPlayers);
    setIsTradingTiles(!isTradingTiles);
  }

  const tradeSelectedTiles = () => {
    const newTileBag = cloneDeep(tileBag);
    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;

    rack.forEach((tile, i) => {
      if (tile.className === 'tile-selected') {
        tile.className = 'tile';
        newTileBag.push(tile);
        rack[i] = newTileBag.splice(0, 1)[0];
      }
    });

    setTileBag(newTileBag);
    setPlayers(newPlayers);
    setIsTradingTiles(!isTradingTiles);
    setTurns(turns + 1)
    setUploadType(UPDATE_GAME);
  }

  return (
    <GameContext.Provider value ={{
      gameId,
      board,
      tileBag,
      grabbedTile,
      letterSelectVisible,
      isTradingTiles,
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
      skipTurn,
      recallTiles,
      shuffleTiles,
      toggleIsTradingTiles,
      tradeSelectedTiles,
      selectTile
    }}>
      {props.children}
    </GameContext.Provider>
  );
}