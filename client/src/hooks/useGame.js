import { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { SocketContext } from '../contexts/SocketContext';
import { addTilesToRack } from '../utils/gameUtils';
import Trie from '../utils/trie.js'
import wordList from '../utils/wordList.json'
import Board from '../utils/board.js';
import Solver from '../utils/solver.js';
import { cloneDeep, shuffle } from 'lodash';

const dictionary = new Trie(wordList);
const board = new Board(dictionary);
const solver = new Solver(dictionary, board);

export default function useGame() {  
  const { user } = useContext(UserContext);
  const { getGame, isOnline, putGame, gameData } = useContext(SocketContext);
  const { gameId } = useParams();

  const [grabbedTile, setGrabbedTile] = useState(null);
  const [cells, setCells] = useState(board.cells);
  const [isTradingTiles, setIsTradingTiles] = useState(false);
  const [gameName, setGameName] = useState(null);
  const [tileBag, setTileBag] = useState(null);
  const [turns, setTurns] = useState(0);
  const [players, setPlayers] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [letterSelectVisible, setLetterSelectVisible] = useState(false);
  const [emit, setEmit] = useState(false);
  const [customEmitValue, setCustomEmitValue] = useState(null);
  
  const playerIndex = players && turns % players.length;
  const isPlayersTurn = players 
    && players[playerIndex].userId === user.id 
    && !gameOver;

  // Request game based on gameId in url
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

        board.resetCells();

        game.boardTiles.forEach(cell => {
          // const [y, x] = get2dPos(cell.index);
          board.setCellTile(cell.index, cell.tile);
        });

        setCells(board.cells);
        setPlayers(game.players);
        setTileBag(game.tileBag);
        setTurns(game.turns);
        setGameName(game.name);
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

    if (gameData) {
      // clear grabbedTile before setting gameState
      // This prevents the grabbed tile from being duplicated when player's rack is reloaded
      setGrabbedTile(null);
      setGameState(gameData);
    }
  }, [gameData]);
  
  // Emit gameState to server when 'emit' is 'true'
  useEffect(() => {
    console.log('Emitting gamestate: ', emit, customEmitValue);
    if (!emit) return;

    const game = customEmitValue || {
      name: gameName,
      id: gameId,
      boardTiles: board.getPlacedTiles(),
      tileBag,
      turns,
      players,
      gameOver
    };

    putGame(game);
    setCustomEmitValue(null);
    setEmit(false);
  }, [emit]);

  const playWords = () => {
    if (!isPlayersTurn) return;

    const [validPlacement, reason] = board.isValidPlacement();
    const playedWords = board.getPlayedWords();

    if (!validPlacement || playedWords.length === 0) {
      alert('Invalid Move: ' + reason);
      board.markInvalidTiles();
      setCells(board.cells);
      return;
    }

    const invalidWords = board.evaluatePlayedWords(playedWords);

    if (invalidWords.length > 0) {
      board.markInvalidWords(invalidWords);
      setCells(board.cells);
      alert(invalidWords.map(word => {
        return `${word.map(cell => cell.tile.letter).join('')} is not a word`;
      }).join('\n'));
      return;
    }

    const movePoints = board.scorePlayedWords(playedWords, turns, true);

    setCells(board.cells);
    endTurn(movePoints);
  };

  const endTurn = (movePoints) => {
    const newTileBag = [...tileBag];
    const newPlayers = cloneDeep(players);

    newPlayers[playerIndex].score += movePoints;
    
    const rack = newPlayers[playerIndex].tiles;

    // Return grabbedTile to rack
    if (grabbedTile !== null) {
      addTilesToRack(rack, [{
        ...grabbedTile,
        className: 'tile',
      }])

      setGrabbedTile(null);
    }

    // Draw tiles from tileBag
    const numTiles = rack.filter(tile => tile === null).length;
    const newTiles = newTileBag.splice(0, numTiles);

    addTilesToRack(rack, newTiles);

    // Game over condition
    if (newTileBag.length === 0 && rack.every(tile => tile === null)) {
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
    const rack = newPlayers[playerIndex].tiles;
    const index = Number(event.target.dataset.index)
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
    const index = Number(target.dataset.index);

    if (grabbedTile === null) return;
    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;
    
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
    const [y, x] = board.get2dPos(event.target.dataset.index);
    const tileInBoardCell = board.getCellTile([y, x]);

    if (
      !isPlayersTurn
      || grabbedTile !== null
      || !tileInBoardCell
      || tileInBoardCell.playedTurn !== null
    ) return;

    setGrabbedTile({
      ...tileInBoardCell,
      letter: tileInBoardCell.points > 0 ? tileInBoardCell.letter : null,
      className: 'tile--grabbed',
    });
    
    board.resetInvalidTiles();
    board.setCellTile([y, x], null);
    setCells(board.cells);
  };

  const placeTileOnBoard = (event) => {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const [y, x] = board.get2dPos(target.dataset.index);
    const tileInBoardCell = board.getCellTile([y, x]);

    if (
      grabbedTile === null 
      || !isPlayersTurn
      || (tileInBoardCell && tileInBoardCell.playedTurn !== null)
    ) return;
      
    // If a tile is already on board, store existing tile to swap with grabbedTile
    const swapTile = tileInBoardCell !== null
      ? {
        ...tileInBoardCell,
        className: 'tile--grabbed',
      }
      : null;

    board.setCellTile([y, x], {
      ...grabbedTile,
      className: 'tile'
    });

    board.resetInvalidTiles();
    setCells(board.cells);

    if (grabbedTile.letter === null) {
      setLetterSelectVisible(true);
    }

    setGrabbedTile(swapTile);
  };

  const selectTile = (event) => {
    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;
    const index = Number(event.target.dataset.index);
    
    rack[index].className = rack[index].className === 'tile--selected'
      ? 'tile' 
      : 'tile--selected';

    setPlayers(newPlayers);
  };

  const recallTiles = () => {
    if (!isPlayersTurn) return;
    
    board.resetInvalidTiles();
    const recalledTiles = board.removeUnplayedTiles();
    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;

    addTilesToRack(rack, recalledTiles);
    
    setCells(board.cells);
    setPlayers(newPlayers);
  };

  const skipTurn = () => {
    if (!isPlayersTurn) return;

    board.resetInvalidTiles();
    const recalledTiles = board.removeUnplayedTiles();

    if (grabbedTile !== null) {
      recalledTiles.push({
        ...grabbedTile,
        className: 'tile',
      });

      setGrabbedTile(null);
    }

    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;

    addTilesToRack(rack, recalledTiles);

    setCells(board.cells);
    setPlayers(newPlayers);
    setTurns(turns + 1);
    setEmit(true);
  };

  const shuffleTiles = () => {
    const newPlayers = cloneDeep(players);

    newPlayers[playerIndex].tiles = shuffle(newPlayers[playerIndex].tiles);
    setPlayers(newPlayers);
  };

  const toggleIsTradingTiles = () => {
    if (!isPlayersTurn) return;

    board.resetInvalidTiles();
    const recalledTiles = board.removeUnplayedTiles();

    if (grabbedTile !== null) {
      recalledTiles.push({
        ...grabbedTile,
        className: 'tile',
      });

      setGrabbedTile(null);
    }

    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;

    addTilesToRack(rack, recalledTiles);

    setCells(board.cells);
    setPlayers(newPlayers);
    setIsTradingTiles(!isTradingTiles);
  };

  const tradeSelectedTiles = () => {
    const newTileBag = cloneDeep(tileBag);
    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;

    if (!rack.some(tile => tile && tile.className === 'tile--selected')) {
      setIsTradingTiles(!isTradingTiles);
      return;
    }

    rack.forEach((tile, i) => {
      if (tile && tile.className === 'tile--selected') {
        tile.className = 'tile';
        newTileBag.push(tile);
        rack[i] = newTileBag.shift();
      }
    });

    setTileBag(newTileBag);
    setPlayers(newPlayers);
    setIsTradingTiles(!isTradingTiles);
    setTurns(turns + 1)
    setEmit(true);
  };
  
  const selectLetter = (letter) => {
    board.setBlankTileLetter(letter);

    setCells(board.cells);
    setLetterSelectVisible(false);
  };

  const bestWord = () => {
    if (!isPlayersTurn || players[playerIndex].bestWords === 0) return;
    
    const newPlayers = cloneDeep(players);
    const rack = newPlayers[playerIndex].tiles;

    board.resetInvalidTiles();
    const recalledTiles = board.removeUnplayedTiles();

    if (grabbedTile !== null) {
      recalledTiles.push({
        ...grabbedTile,
        className: 'tile',
      });

      setGrabbedTile(null);
    }

    addTilesToRack(rack, recalledTiles);

    const bestMove = solver.findAllOptions(rack, turns)[0];

    if (!bestMove) {
      alert('No moves found');
      return;
    }

    newPlayers[playerIndex].bestWords -= 1;

    bestMove.letters.forEach((letter, i) => {
      if (board.getCellTile(bestMove.positions[i]) !== null) return;

      let rackIndex = rack.findIndex(tile => tile && tile.letter === letter);
      if (rackIndex === -1) {
        rackIndex = rack.findIndex(tile => tile && tile.letter === null);
      }

      if (rackIndex === -1) return;

      const tile = {
        ...rack[rackIndex],
        letter: letter,
      }
      
      rack[rackIndex] = null;
      board.setCellTile(bestMove.positions[i], tile);
    });

    setCells(board.cells);
    setPlayers(newPlayers);
    
    const customEmit = cloneDeep(gameData);
    customEmit.players[playerIndex].bestWords -= 1;

    setCustomEmitValue(customEmit);
    setEmit(true);
  }

  return {
    grabbedTile,
    cells,
    isTradingTiles,
    tileBag,
    turns,
    players,
    gameOver,
    letterSelectVisible,
    playerIndex,
    isPlayersTurn,
    dictionary,
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
    selectLetter,
    bestWord,
  };
}
