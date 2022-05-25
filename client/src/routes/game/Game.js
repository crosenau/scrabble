import { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Board from './Board';
import Rack from './Rack';
import Tile from './Tile';
import GreenButton from '../../components/GreenButton';
import PlayerList from './PlayerList';
import LetterSelection from './LetterSelection';
import { UserContext } from '../../contexts/UserContext';
import { SocketContext } from '../../contexts/SocketContext';
import {
  get2dPos,
  createEmptyBoard,
  isValidPlacement,
  getPlayableWords,
  getPlacedTiles,
  addTilesToBoard,
  drawTiles,
  recallTilesFromBoard
} from '../../utils/gameUtils';
import { isWord } from '../../utils/dictionary';
import { cloneDeep, shuffle } from 'lodash';
import './game.scss';

export default function Game() {
  const { user } = useContext(UserContext);
  const { getGame, isOnline, putGame, gameState } = useContext(SocketContext);
  const { gameId } = useParams();

  const [grabbedTile, setGrabbedTile] = useState(null);
  const [letterSelectVisible, setLetterSelectVisible] = useState(false);
  const [isTradingTiles, setIsTradingTiles] = useState(false);
  const [gameName, setGameName] = useState(null);
  const [board, setBoard] = useState(null);
  const [tileBag, setTileBag] = useState(null);
  const [turns, setTurns] = useState(0);
  const [players, setPlayers] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [emit, setEmit] = useState(false);
  
  const playerIndex = turns % players.length;
  const grabbedTileOffset = Math.min(window.innerWidth, window.innerHeight) / 30;

  // Request gameId from url
  useEffect(() => {
    if (isOnline) {
      getGame(gameId);
    }
  }, [isOnline, gameId]);

  // Update gameState when server sends data
  useEffect(() => {
    console.log('gameState received');
    if (gameState) {
      setGameState(gameState);
    }
  }, [gameState]);
  
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

  const setGameState = (game, emitAfter = false) => {
    console.log('setGameState', emitAfter);
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

      const newBoard = addTilesToBoard(game.boardTiles, createEmptyBoard());
      setBoard(newBoard);
  
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
        row.forEach(cell => {
          if (cell.tile && cell.tile.playedTurn === null) {
            cell.tile.className = 'tile--invalid';
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
        row.forEach(cell => {
          if (cell.tile && cell.tile.playedTurn === null) {
            cell.tile.className = 'tile--invalid';
          }
        });
      })
      setBoard(newBoard);
      return;
    }

    const invalidWords = playedWords.reduce((prevWords, word) => {
      const text = word.map(cell => cell.tile.letter).join('');
      console.log('isWord ', text, isWord(text));
      if (!isWord(text)) {
        return [...prevWords, word]
      }
      return prevWords;
    }, [])

    if (invalidWords.length > 0) {
      invalidWords.forEach(word => {
        const text = word.map(cell => cell.tile.letter).join('');
        const indices = word.map(cell => cell.index);
        alert(`${text} is not a valid word`);
        newBoard = newBoard.map(row => {
          return row.map(cell => {
            if (cell.tile && indices.includes(cell.index)) {
              cell.tile.className = 'tile--invalid';
            }
            return cell;
          });
        })
        setBoard(newBoard);
      });
      return;
    }

    // Set className for previously scored tiles
    newBoard.flat().forEach(cell => {
      if (cell.tile && cell.tile.playedTurn !== null) {
        cell.tile.className = 'tile--played';
        cell.tile.totalPoints = null;
      }
    });

    const newPlayers = cloneDeep(players);

    // Mark newly played tiles and update user's score
    playedWords.forEach(word => {
      const indices = word.map(cell => cell.index);
      const score = scoreWord(word);
      newBoard.flat().forEach(cell => {
        if (cell.tile && indices.includes(cell.index)) {
          cell.tile.className = 'tile--scored';
          cell.tile.playedTurn = turns;
          cell.tile.totalPoints = cell.index === indices[indices.length-1]
            ? score
            : cell.tile.totalPoints
        }
      });
      newPlayers[playerIndex].score += score;
    });

    const newTileBag = [...tileBag];
    drawTiles(newTileBag, newPlayers[playerIndex].tiles);

    // Game over condition
    if (newTileBag.length === 0 && newPlayers[playerIndex].tiles.length === 0) {
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
    word.forEach(cell => {
      if (cell.letterScoreMod && cell.tile.playedTurn === null) {
        score += (cell.tile.points * cell.letterScoreMod);
      } else {
        score += cell.tile.points;
      }
      if (cell.wordScoreMod && cell.tile.playedTurn === null) {
        wordScoreMod = cell.wordScoreMod;
      }
      if (cell.tile.playedTurn === null) {
        playedTiles += 1;
      }
    });

    score *= wordScoreMod;
    score += (playedTiles === 7) ? 50 : 0;
    return score;
  };

  // Input handling
  const pointerDownHandler = (event) => {
    if (event.target.className === 'rack__cell') {
      if (isTradingTiles) {
        selectTile(event);
      } else {
        grabTileFromRack(event);
      }
    } else if (event.target.className.includes('board__cell')) {
      grabTileFromBoard(event);
    }
  }

  const pointerUpHandler = (event) => {
    const target = document.elementFromPoint(event.clientX, event.clientY);

    if (target.className === 'rack__cell') {
      placeTileOnRack(event);
    } else if (target.className.includes('board__cell')) {
      placeTileOnBoard(event);
    }
  }

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
      || board[y][x].tile.playedTurn !== null
      || players[playerIndex].userId !== user.id
    ) return;
    
    setGrabbedTile({
      ...board[y][x].tile,
      letter: board[y][x].tile.points > 0 ? board[y][x].tile.letter : null,
      className: 'tile--grabbed',
      dragPosX: `${event.clientX - grabbedTileOffset}px`,
      dragPosY: `${event.clientY - grabbedTileOffset}px`,
    });

    // Reset classNames for tiles marked as invalid
    const lastPlayedTurn = board
      .flat()
      .map(cell => cell.tile ? cell.tile.playedTurn : 0)
      .reduce((a, b) => a > b ? a : b);
    const newBoard = cloneDeep(board).map(row => {
      return row.map(cell => {
        if (cell.tile && cell.tile.className === 'tile--invalid') {
          if (cell.tile.playedTurn === null) {
            cell.tile.className = 'tile';
          } else if (cell.tile.playedTurn === lastPlayedTurn) {
            cell.tile.className = 'tile--scored';
          } else {
            cell.tile.className = 'tile--played';
          }
        }

        return cell;
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
      || (board[y][x].tile && board[y][x].tile.playedTurn !== null)
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

    // Reset classNames for tiles marked as invalid
    const lastPlayedTurn = board
      .flat()
      .map(cell => cell.tile ? cell.tile.playedTurn : 0)
      .reduce((a, b) => a > b ? a : b);

    newBoard.forEach(row => {
      row.forEach(cell => {
        if (cell.tile && cell.tile.className === 'tile--invalid') {
          if (cell.tile.playedTurn === null) {
            cell.tile.className = 'tile';
          } else if (cell.tile.playedTurn === lastPlayedTurn) {
            cell.tile.className = 'tile--scored';
          } else {
            cell.tile.className = 'tile--played';
          }
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
  
  const isReady = tileBag !== null;

  if (!isReady) {
    console.log('not ready')
    return <div className="game">Loading...</div>
  }
  
  return (
    <div 
      className="game"
      onPointerDown={pointerDownHandler}
      onPointerMove={moveGrabbedTile}
      onPointerUp={pointerUpHandler}
    >
      <div className="game__section-1">
        <PlayerList 
          players={players}
          turns={turns}
          gameOver={gameOver}
        />
        <div className="info">
          <div>Tiles: {tileBag.length}</div>
          <div>Turn: {turns+1}</div>
        </div>
        <div className="turn-buttons">
          <GreenButton label="Skip" type="button" onClick={skipTurn} />
          { isTradingTiles
            ? <GreenButton label="Confirm" type="button" onClick={tradeSelectedTiles} />
            : <GreenButton label="Trade" type="button" onClick={toggleIsTradingTiles} />
          }

          <GreenButton label="Play" type="button" onClick={playWords} />
        </div>
      </div>
      <div className="game__section-2">
        <Board 
          board={board}
          players={players}
          turns={turns}
        />
        <Rack players={players}/>
        <div className="tile-buttons">
          <GreenButton label="Recall" type="button" onClick={recallTiles} />
          <GreenButton label="Shuffle" type="button" onClick={shuffleTiles} />
        </div>
      </div>
      { grabbedTile ? (
        <Tile
          tile={grabbedTile}
          style={{
            top: grabbedTile.dragPosY, 
            left: grabbedTile.dragPosX
          }}
        />
      ) : null }
      { letterSelectVisible ? <LetterSelection selectLetter={selectLetter} /> : null }
    </div>
  );
}
