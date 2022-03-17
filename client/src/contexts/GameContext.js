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
  recallTilesFromBoard,
  createTestBag
} from '../utils/gameUtils';
import { isWord } from '../utils/dictionary';
import { NEW_GAME, UPDATE_GAME, JOIN_GAME } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep, shuffle } from 'lodash';
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
  const [gameOver, setGameOver] = useState(false);
  const [socket, setSocket] = useState(null);
  const [uploadType, setUploadType] = useState(null);
  const [roomId, setRoomId] = useState(null);
  
  const playerIndex = turns % players.length;

  useEffect(() => {
    // create new socket
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
      players,
      gameOver
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
      players,
      gameOver: false
    };

    setGameState(initialState, NEW_GAME);
  };

  const setGameState = (game, nextAction = null) => {
    console.log('setGameState');
    try {
      if (user.id && !game.players.some(player => player.userId === user.id)) {
        console.log(`user ${user.id} not in game. Adding.`);
        console.log(user);
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
  
      setTileBag(game.tileBag);
      setTurns(game.turns);
      setGameId(game.id);
      setGameName(game.name);
      setPlayers(game.players);
      setLetterSelectVisible(false);
      setIsTradingTiles(false);
      setGameOver(game.gameOver);
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

  const playWords = () => {
    if (gameOver || players[playerIndex].userId !== user.id) return;

    let newBoard = cloneDeep(board);

    if (!isValidPlacement(board)) {
      alert('Invalid Move');
      newBoard.forEach(row => {
        row.forEach(square => {
          if (square.tile && !square.tile.played) {
            square.tile.className = 'tile--invalid';
          }
        });
      })
      setBoard(newBoard);
      return;
    }

    const playedWords = getPlayableWords(board);
    if (playedWords.length === 0) {
      alert('no played words');
      newBoard.forEach(row => {
        row.forEach(square => {
          if (square.tile && !square.tile.played) {
            square.tile.className = 'tile--invalid';
          }
        });
      })
      setBoard(newBoard);
      return;
    }

    const invalidWords = playedWords.reduce((prevWords, word) => {
      const text = word.map(square => square.tile.letter).join('');
      console.log('isWord ', text, isWord(text));
      if (!isWord(text)) {
        return [...prevWords, word]
      }
      return prevWords;
    }, [])

    if (invalidWords.length > 0) {
      invalidWords.forEach(word => {
        const text = word.map(square => square.tile.letter).join('');
        const indices = word.map(square => square.index);
        alert(`${text} is not a valid word`);
        newBoard = newBoard.map(row => {
          return row.map(square => {
            if (square.tile && indices.includes(square.index)) {
              square.tile.className = 'tile--invalid';
            }
            return square;
          });
        })
        setBoard(newBoard);
      });
      return;
    }

    let playerScore = players[playerIndex].score;

    // Set className for previously scored tiles
    newBoard.flat().forEach(square => {
      if (square.tile && square.tile.played) {
        square.tile.className = 'tile--played';
        square.tile.totalPoints = null;
      }
    });

    // Update new played tiles
    playedWords.forEach(word => {
      const indices = word.map(square => square.index);
      const score = scoreWord(word);
      newBoard.flat().forEach(square => {
        if (square.tile && indices.includes(square.index)) {
          square.tile.className = 'tile--scored';
          square.tile.played = true;
          square.tile.totalPoints = square.index === indices[indices.length-1]
            ? score
            : square.tile.totalPoints
        }
      });
      playerScore += score;
    });

    const newPlayers = cloneDeep(players);
    const newTileBag = [...tileBag];
    newPlayers[playerIndex].score = playerScore;
    drawTiles(newTileBag, newPlayers[playerIndex].tiles);

    if (newTileBag.length === 0 && newPlayers[playerIndex].tiles.length === 0) {
      newPlayers.forEach((player, i) => {
        if (i === playerIndex) return;

        const unplayedPoints = player.tiles.reduce((totalPoints, tile) => {
          return tile !== null 
            ? totalPoints + tile.points
            : totalPoints
        }, 0);

        player.score -= unplayedPoints;
        newPlayers[playerIndex].score += unplayedPoints;

      });
      setGameOver(true);
    }

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
      className: 'tile--grabbed',
      dragPosX: `${event.clientX - 20}px`,
      dragPosY: `${event.clientY - 20}px`,
    });
  }

  const placeTileOnRack = (index, swapTiles = false) => {
    if (grabbedTile === null) return;
    const newPlayers = cloneDeep(players);
    const rack = newPlayers.filter(player => player.userId === user.id)[0].tiles;
    const swap = swapTiles 
      ? { 
        ...rack[index],
        className: 'tile--grabbed'
      }
      : null;
    rack[index] = {
      ...grabbedTile,
      className: 'tile'
    };
    setPlayers(newPlayers);
    setGrabbedTile(swapTiles ? swap : null);
  }

  const grabTileFromBoard = (event, tile, index) => {
    if (
      grabbedTile !== null 
      || tile.played === true
      || players[playerIndex].userId !== user.id
    ) return;
    const newBoard = cloneDeep(board).map(row => {
      return row.map(square => {
        if (square.tile && square.tile.className === 'tile--invalid') {
          square.tile.className = square.tile.played 
            ? 'tile--played'
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
      className: 'tile--grabbed',
      grabbed: true,
      dragPosX: `${event.clientX - 20}px`,
      dragPosY: `${event.clientY - 20}px`,
    });
  }

  const placeTileOnBoard = (index, swapTiles = false) => {
    const [y, x] = get2dPos(index);
    
    if (
      grabbedTile === null 
      || players[playerIndex].userId !== user.id
      || (board[y][x].tile && board[y][x].tile.played)
      ) return;

    const newBoard = cloneDeep(board);
    const swap = swapTiles
      ? {
        ...newBoard[y][x].tile,
        className: 'tile--grabbed'
      }
      : null;
    newBoard[y][x].tile = {
      ...grabbedTile,
      grabbed: false,
      className: 'tile'
    };
    newBoard.forEach(row => {
      row.forEach(square => {
        if (square.tile && square.tile.className === 'tile--invalid') {
          square.tile.className = square.tile.played 
            ? 'tile--played'
            : 'tile'
        }
      });
    })
    setBoard(newBoard);
    if (grabbedTile.letter === null) {
      setLetterSelectVisible(true);
    }

    setGrabbedTile(swapTiles ? swap : null);
  }

  const selectTile = (e, tile, index) => {
    const newPlayers = cloneDeep(players);
    const tiles = newPlayers[playerIndex].tiles;
    tiles[index].className = tile.className === 'tile--selected'
      ? 'tile'
      : 'tile--selected'

    setPlayers(newPlayers);
  }

  const recallTiles = () => {
    if (players[playerIndex].userId !== user.id) return;
    
    const newBoard = cloneDeep(board);
    const newPlayers = cloneDeep(players);
    const playerTiles = newPlayers[playerIndex].tiles;

    recallTilesFromBoard(newBoard, playerTiles);
    setBoard(newBoard);
    setPlayers(newPlayers);
  }

  const skipTurn = () => {
    if (players[playerIndex].userId !== user.id) return;

    const newBoard = cloneDeep(board);
    const newPlayers = cloneDeep(players);
    const playerTiles = newPlayers[playerIndex].tiles;

    recallTilesFromBoard(newBoard, playerTiles);
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
    setBoard(newBoard);
    setPlayers(newPlayers);
    setIsTradingTiles(!isTradingTiles);
  }

  const tradeSelectedTiles = () => {
    const newTileBag = cloneDeep(tileBag);
    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;

    if (!rack.some(tile => tile.className === 'tile--selected')) {
      setIsTradingTiles(!isTradingTiles);
      return;
    }

    rack.forEach((tile, i) => {
      if (tile.className === 'tile--selected') {
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
      gameOver,
      setGameState,
      createGame,
      grabTileFromRack,
      placeTileOnRack,
      grabTileFromBoard,
      placeTileOnBoard,
      moveGrabbedTile,
      selectLetter,
      playWords,
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