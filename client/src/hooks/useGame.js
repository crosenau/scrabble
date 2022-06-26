import { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { SocketContext } from '../contexts/SocketContext';
import {
  get2dPos,
  createEmptyBoard,
  getPlacedTiles,
  resetInvalidTiles,
  addTilesToRack,
  getPlayableWords,
  isValidPlacement,
  markInvalidTiles,
  evaluatePlayedWords,
  markInvalidWords,
  scorePlayedWords,
  removeUnplayedTiles
} from '../utils/gameUtils';
import { cloneDeep, shuffle } from 'lodash';

export default function useGame() {  
  const { user } = useContext(UserContext);
  const { getGame, isOnline, putGame, gameData } = useContext(SocketContext);
  const { gameId } = useParams();

  const [grabbedTile, setGrabbedTile] = useState(null);
  const [board, setBoard] = useState(createEmptyBoard());
  const [isTradingTiles, setIsTradingTiles] = useState(false);
  const [gameName, setGameName] = useState(null);
  const [tileBag, setTileBag] = useState(null);
  const [turns, setTurns] = useState(0);
  const [players, setPlayers] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [letterSelectVisible, setLetterSelectVisible] = useState(false);
  const [emit, setEmit] = useState(false);
  
  const playerIndex = turns % players.length;

  // Request gameId from url
  useEffect(() => {
    if (isOnline) {
      getGame(gameId);
    }
  }, [isOnline, gameId]);

  // Update gameState when server sends data
  useEffect(() => {
    console.log('gameData received');
    const setGameState = (game) => {
      console.log('setGameState');
      let emitAfter = false;

      try {
        if (user.id && !game.players.some(player => player.userId === user.id)) {
          console.log(`user ${user.id} not in game. Adding.`);
          emitAfter = true;
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

        setBoardTiles(game.boardTiles);
    
        setTileBag(game.tileBag);
        setTurns(game.turns);
        setGameName(game.name);
        setPlayers(game.players);
        setLetterSelectVisible(false);
        setIsTradingTiles(false);
        setGameOver(game.gameOver);
        if (emitAfter) {
          console.log('emitting gameState');
          setEmit(true);
        }
      } catch(error) {
        console.log(error);
      }
    }

    if (gameData) setGameState(gameData);
  }, [gameData]);
  
  // Emit gameState to server when 'emit' it 'true'
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

  const setBoardTiles = (cells) => {
    const newBoard = createEmptyBoard();
    
    for (let cell of cells) {
      const [y, x] = get2dPos(cell.index);
      newBoard[y][x].tile = cell.tile;
    }

    setBoard(newBoard);
  };

  const playWords = () => {
    if (gameOver || players[playerIndex].userId !== user.id) return;
    const newBoard = cloneDeep(board);

    const validPlacement = isValidPlacement(newBoard);
    const playedWords = getPlayableWords(newBoard);

    if (!validPlacement || playedWords.length === 0) {
      alert('Invalid Move');
      markInvalidTiles(newBoard);
      setBoard(newBoard);
      return;
    }

    const invalidWords = evaluatePlayedWords(playedWords);

    if (invalidWords.length > 0) {
      markInvalidWords(invalidWords, newBoard);
      setBoard(newBoard);
      alert(invalidWords.map(word => {
        return `${word.map(cell => cell.tile.letter).join('')} is not a word`;
      }).join('\n'));
      return;
    }

    const movePoints = scorePlayedWords(playedWords, newBoard, turns);

    setBoard(newBoard);
    endTurn(movePoints);
  };

  const endTurn = (movePoints) => {
    const newTileBag = [...tileBag];
    const newPlayers = cloneDeep(players);

    newPlayers[playerIndex].score += movePoints;

    // Draw tiles from tileBag
    const rack = newPlayers[playerIndex].tiles;
    const numTiles = rack.filter(tile => tile === null).length;
    const newTiles = newTileBag.splice(0, numTiles);

    addTilesToRack(rack, newTiles);

    // Game over condition
    if (
      newTileBag.length === 0 
      && newPlayers[playerIndex].tiles.filter(tile => tile !== null).length === 0
      ) {
      newPlayers.forEach((player, i) => {
        if (i === playerIndex) return;

        // Deduct unplayed tile points from other players and add to finishing player
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

    setPlayers(newPlayers);
    setTurns(turns + 1);
    setTileBag(newTileBag);
    setEmit(true);
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
    });
    rack[index] = null;
    setPlayers(newPlayers);
  };

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
      }
      : null;

    rack[index] = {
      ...grabbedTile,
      className: 'tile',
    };
    setPlayers(newPlayers);
    setGrabbedTile(swapTile);
  };

  const grabTileFromBoard = (event) => {
    const [y, x] = get2dPos(event.target.dataset.index);

    if (
      players[playerIndex].userId !== user.id
      || grabbedTile !== null
      || !board[y][x].tile
      || board[y][x].tile.playedTurn !== null
    ) return;

    setGrabbedTile({
      ...board[y][x].tile,
      letter: board[y][x].tile.points > 0 ? board[y][x].tile.letter : null,
      className: 'tile--grabbed',
    });

    const newBoard = cloneDeep(board);
    
    resetInvalidTiles(newBoard);
    newBoard[y][x].tile = null;
    setBoard(newBoard);
  };

  const placeTileOnBoard = (event) => {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const [y, x] = get2dPos(target.dataset.index);

    if (
      grabbedTile === null 
      || players[playerIndex].userId !== user.id
      || (board[y][x].tile && board[y][x].tile.playedTurn !== null)
    ) return;
      
    // If a tile is already on board, store existing tile to swap with grabbedTile
    const swapTile = board[y][x].tile !== null
      ? {
        ...board[y][x].tile,
        className: 'tile--grabbed',
      }
      : null;

    const newBoard = cloneDeep(board);

    newBoard[y][x].tile = {
      ...grabbedTile,
      className: 'tile'
    };

    resetInvalidTiles(newBoard);
    setBoard(newBoard);

    if (grabbedTile.letter === null) {
      setLetterSelectVisible(true);
    }

    setGrabbedTile(swapTile);
  };

  const selectTile = (event) => {
    const newPlayers = cloneDeep(players);
    const tiles = newPlayers[playerIndex].tiles;
    const index = event.target.dataset.index;
    tiles[index].className = tiles[index].className === 'tile--selected'
      ? 'tile'
      : 'tile--selected'

    setPlayers(newPlayers);
  };

  const recallTiles = () => {
    if (players[playerIndex].userId !== user.id) return;
    
    const newBoard = cloneDeep(board);
    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;

    resetInvalidTiles(newBoard);
    const recalledTiles = removeUnplayedTiles(newBoard);

    addTilesToRack(rack, recalledTiles);
    
    setBoard(newBoard);
    setPlayers(newPlayers);
  };

  const skipTurn = () => {
    if (players[playerIndex].userId !== user.id) return;

    const newBoard = cloneDeep(board);
    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;

    resetInvalidTiles(newBoard);
    const recalledTiles = removeUnplayedTiles(newBoard);

    addTilesToRack(rack, recalledTiles);

    setBoard(newBoard);
    setPlayers(newPlayers);
    setTurns(turns + 1);
    setEmit(true);
  };

  const shuffleTiles = () => {
    const shuffleIndex = players.findIndex(player => player.userId === user.id);
    const newPlayers = cloneDeep(players);
    newPlayers[shuffleIndex].tiles = shuffle(newPlayers[shuffleIndex].tiles);

    setPlayers(newPlayers);
  };

  const toggleIsTradingTiles = () => {
    if (players[playerIndex].userId !== user.id) return;

    const newBoard = cloneDeep(board);
    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;

    resetInvalidTiles(newBoard);
    const recalledTiles = removeUnplayedTiles(newBoard);

    addTilesToRack(rack, recalledTiles);

    setBoard(newBoard);
    setPlayers(newPlayers);
    setIsTradingTiles(!isTradingTiles);
  };

  const tradeSelectedTiles = () => {
    const newTileBag = cloneDeep(tileBag);
    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;

    if (!rack.some(tile => tile.className === 'tile--selected')) {
      setIsTradingTiles(!isTradingTiles);
      return;
    }

    rack.forEach((tile, i) => {
      if (tile && tile.className === 'tile--selected') {
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

  return {
    grabbedTile,
    board,
    isTradingTiles,
    tileBag,
    turns,
    players,
    gameOver,
    letterSelectVisible,
    selectTile,
    grabTileFromBoard,
    grabTileFromRack,
    placeTileOnBoard,
    placeTileOnRack,
    skipTurn,
    tradeSelectedTiles,
    toggleIsTradingTiles,
    playWords,
    recallTiles,
    shuffleTiles,
    selectLetter
  }
}
