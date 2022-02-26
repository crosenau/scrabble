import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserContext } from './UserContext';
import {
  get2dPos,
  createEmptyBoard,
  isValidPlacement,
  getPlayableWords,
  editBoardByFilter,
  editBoardByIndices,
  getPlacedTiles,
  addTilesToBoard
} from '../utils/boardUtils';
import { createTileBag, createTestBag } from '../utils/tileUtils';
import { isWord } from '../utils/dictionary';
import { v4 as uuidv4 } from 'uuid';

export const GameContext = createContext();

export default function GameContextProvider(props) {
  const { user } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [gameName, setGameName] = useState(null);
  const [board, setBoard] = useState(null);
  const [tileBag, setTileBag] = useState(null);
  const [rack, setRack] = useState([]);
  const [grabbedTile, setGrabbedTile] = useState(null);
  const [letterSelectVisible, setLetterSelectVisible] = useState(false);
  const [turns, setTurns] = useState(0);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function checkThenUploadGame() {
      if (gameId === null) return;
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
        
        let status = await uploadGameState(url, method);
        console.log('status ', status)
        if (status === 'success') {
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
    checkThenUploadGame();
  }, [players])

  const createGame = (name, numPlayers) => {
    let initialPlayers = [
      {
        userId: user.id,
        userName: user.name,
        tiles: [],
        score: 0
      }
    ]

    for (let x = 1; x < numPlayers; x++) {
      initialPlayers.push({
        userId: null,
        userName: 'Waiting for player',
        tiles: [],
        score: 0
      });
    }

    const initialState = {
      name,
      id: uuidv4(),
      boardTiles: getPlacedTiles(createEmptyBoard()),
      tileBag: createTileBag(),
      turns: 0,
      players: initialPlayers
    };

    setGameState(initialState);
  };

  const setGameState = (game) => {
    if (!game.players.some((player) => player.userId === user.id)) {
      const insertIndex = game.players.findIndex((player) => player.userId === null);
      if (insertIndex === -1) {
        throw new Error('Game is full');
      }
      game.players[insertIndex] = {
        userId: user.id,
        userName: user.name,
        tiles: [],
        score: 0
      }
    } 
    const updatedBoard = addTilesToBoard(game.boardTiles, createEmptyBoard());
    setBoard(updatedBoard);

    const player = game.players.filter(player => player.userId === user.id);
    setRack(player[0].tiles);
    setTileBag(game.tileBag);
    setTurns(game.turns);
    setGameId(game.id);
    setGameName(game.name);
    setPlayers(game.players);
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

  const uploadGameState = async (url, method) => {    
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

  const drawTiles = () => {
    console.log('drawTiles');
    let updatedRack = [...rack].filter((square) => square !== null);
    const numTiles = 7 - updatedRack.length;
    updatedRack = updatedRack.concat(tileBag.slice(0, numTiles));
    setRack(updatedRack);
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
        let updatedPlayers = JSON.parse(JSON.stringify(players));
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
        updatedPlayers[0].score += score;
        setPlayers(updatedPlayers);
        console.log(players);
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

  const grabTileFromRack = (event, tile, index) => {
    if (grabbedTile !== null) return;
    let updatedrack = [...rack];
    updatedrack[index] = null;
    setRack(updatedrack);
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
    let updatedrack = [...rack];
    updatedrack[index] = {
      ...grabbedTile,
      className: 'tile'
    };
    setRack(updatedrack);
    setGrabbedTile(null);
  }

  const grabTileFromBoard = (event, tile, index) => {
    if (grabbedTile !== null) return;
    let updatedBoard = JSON.parse(JSON.stringify(board));
    editBoardByFilter(
      updatedBoard,
      (square) => square.tile && !square.tile.played,
      (square) => square.tile.className = 'tile'
    )

    const pos2d = get2dPos(index);
    updatedBoard[pos2d[0]][pos2d[1]].tile = null;
    setBoard(updatedBoard);
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
    if (grabbedTile === null) return;
    let updatedBoard = JSON.parse(JSON.stringify(board));
    const pos2d = get2dPos(index);
    updatedBoard[pos2d[0]][pos2d[1]].tile = {
      ...grabbedTile,
      grabbed: false,
      className: 'tile'
    };
    editBoardByFilter(
      updatedBoard,
      (square) => square.tile && !square.tile.played,
      (square) => square.tile.className = 'tile'
    )
    setBoard(updatedBoard);
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
      rack,
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
      drawTiles,
      moveGrabbedTile,
      selectLetter,
      playWord,
    }}>
      {props.children}
    </GameContext.Provider>
  );
}