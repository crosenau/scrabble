import { useState } from "react";
import Board from './Board.js';
import Rack from './Rack.js';
import Tile from "./Tile.js";

import { createEmptyBoard, get2dPos } from "../utils/boardUtils.js";
import createTileBag from "../utils/bagUtils.js";

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

  const grabTile = (tile, position, fromRack) => {
    setGrabbedTile({
      tile,
      position,
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

  const placeTile = (position, onRack) => {
    if (grabbedTile === null) return;

    const updatedPlayerTiles = [...playerTiles];
    const updatedBoard = JSON.parse(JSON.stringify(gameBoard));
    
    if (onRack) {
      updatedPlayerTiles[position] = grabbedTile.tile;
    } else {
      const pos2d = get2dPos(position);

      updatedBoard[pos2d[0]][pos2d[1]].tile = grabbedTile.tile;
    }

    if (grabbedTile.fromRack) {
      
      updatedPlayerTiles[grabbedTile.position] = null;
    } else {
      const pos2d = get2dPos(grabbedTile.position);

      updatedBoard[pos2d[0]][pos2d[1]].tile = null;
    }

    setPlayerTiles(updatedPlayerTiles);
    setGameBoard(updatedBoard);
    setGrabbedTile(null);
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
    </div>
  )
};

export default Game;