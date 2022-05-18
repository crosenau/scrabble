import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserContext } from './UserContext';
import { SocketContext } from './SocketContext';
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
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep, shuffle } from 'lodash';

export const GameContext = createContext();

export default function GameContextProvider(props) {
  const { user } = useContext(UserContext);
  const { putGame, gameState } = useContext(SocketContext);

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
  const [emit, setEmit] = useState(false);
  
  const playerIndex = turns % players.length;
  const grabbedTileOffset = Math.min(window.innerWidth, window.innerHeight) / 30;

  useEffect(() => {
    if (gameState) {
      setGameState(gameState);
    }
  }, [gameState]);
  
  useEffect(() => {
    console.log('useEffect - uploadType', emit);
    if (!emit) return;

    const game = {
      name: gameName,
      id: gameId,
      boardTiles: getPlacedTiles(board),
      tileBag,
      turns,
      players,
      gameOver
    };

    putGame(game);
    setEmit(null);
  }, [emit]);

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
        userName: '',
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

    setGameState(initialState, true);
  };

  const setGameState = (game, emitAfter = false) => {
    console.log('setGameState', emitAfter);
    try {
      if (user.id && !game.players.some(player => player.userId === user.id)) {
        console.log(`user ${user.id} not in game. Adding.`);
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
      if (emitAfter) {
        setEmit(true);
      }
    } catch(error) {
      console.log(error);
    }
  }

  const moveGrabbedTile = (event) => {
    if (!grabbedTile) return;
    const newGrabbedTile = { ...grabbedTile };
    newGrabbedTile.dragPosX = `${event.clientX - grabbedTileOffset}px`;
    newGrabbedTile.dragPosY = `${event.clientY - grabbedTileOffset}px`;
    setGrabbedTile(newGrabbedTile);
  };

  const selectLetter = (letter) => {
    const newboard = board;
    
    newboard.forEach(row => {
      row.forEach(cell => {
        if (cell.tile && cell.tile.letter === null) {
          cell.tile.letter = letter;
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
    setEmit(true);
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

  const grabTileFromRack = (event) => {
    const newPlayers = cloneDeep(players);
    const rack = newPlayers.filter(player => player.userId === user.id)[0].tiles;
    const index = event.target.dataset.index
    const tile = rack[index];

    if (grabbedTile !== null || tile === null) return;

    setGrabbedTile({
      ...tile,
      letter: tile.points > 0 ? tile.letter : null,
      className: 'tile--grabbed',
      dragPosX: `${event.clientX - grabbedTileOffset}px`,
      dragPosY: `${event.clientY - grabbedTileOffset}px`,
    });
    rack[index] = null;
    setPlayers(newPlayers);
  }

  const placeTileOnRack = (event) => {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const index = target.dataset.index;

    if (grabbedTile === null) return;
    const newPlayers = cloneDeep(players);
    const rack = newPlayers.filter(player => player.userId === user.id)[0].tiles;
    
    // If a tile is already on rack, store existing tile to swap with grabbedTile
    const swapTile = rack[index] !== null 
      ? { 
        ...rack[index],
        className: 'tile--grabbed',
        dragPosX: `${event.clientX - grabbedTileOffset}px`,
        dragPosY: `${event.clientY - grabbedTileOffset}px`
      }
      : null;

    rack[index] = {
      ...grabbedTile,
      className: 'tile',
    };
    setPlayers(newPlayers);
    setGrabbedTile(swapTile);
  }

  const grabTileFromBoard = (event) => {
    const [y, x] = get2dPos(event.target.dataset.index);
    
    if (
      grabbedTile !== null
      || !board[y][x].tile
      || board[y][x].tile.played === true
      || players[playerIndex].userId !== user.id
    ) return;
    
    setGrabbedTile({
      ...board[y][x].tile,
      letter: board[y][x].tile.points > 0 ? board[y][x].tile.letter : null,
      className: 'tile--grabbed',
      dragPosX: `${event.clientX - grabbedTileOffset}px`,
      dragPosY: `${event.clientY - grabbedTileOffset}px`,
    });

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

    newBoard[y][x].tile = null;
    setBoard(newBoard);
  }

  const placeTileOnBoard = (event) => {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const [y, x] = get2dPos(target.dataset.index);
    
    if (
      grabbedTile === null 
      || players[playerIndex].userId !== user.id
      || (board[y][x].tile && board[y][x].tile.played)
    ) return;

    // If a tile is already on board, store existing tile to swap with grabbedTile
    const swapTile = board[y][x].tile !== null
      ? {
        ...board[y][x].tile,
        className: 'tile--grabbed',
        dragPosX: `${event.clientX - grabbedTileOffset}px`,
        dragPosY: `${event.clientY - grabbedTileOffset}px`,
      }
      : null;

    const newBoard = cloneDeep(board);

    newBoard[y][x].tile = {
      ...grabbedTile,
      className: 'tile'
    };

    // Reset tile classNames
    newBoard.forEach(row => {
      row.forEach(cell => {
        if (cell.tile && cell.tile.className === 'tile--invalid') {
          cell.tile.className = cell.tile.played 
            ? 'tile--played'
            : 'tile'
        }
      });
    })

    setBoard(newBoard);

    if (grabbedTile.letter === null) {
      setLetterSelectVisible(true);
    }

    setGrabbedTile(swapTile);
  }

  const selectTile = (event) => {
    const newPlayers = cloneDeep(players);
    const tiles = newPlayers[playerIndex].tiles;
    const index = event.target.dataset.index;
    tiles[index].className = tiles[index].className === 'tile--selected'
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
    setEmit(true);
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
    setEmit(true);
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