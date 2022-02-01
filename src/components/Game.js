import { useState } from "react";
import Board from './Board.js';
import Rack from './Rack.js';
import GrabbedTile from "./GrabbedTile.js";

import { createEmptyBoard, get2dPos } from "../utils/boardUtils.js";
import createTileBag from "../utils/bagUtils.js";

const Game = () => {
  const [ gameBoard, setGameBoard ] = useState(createEmptyBoard());
  const [ tileBag, setTileBag ] = useState(createTileBag());
  const [ playerTiles, setPlayerTiles ] = useState([]);
  const [ grabbedTile, setGrabbedTile ] = useState(null);
  const [grabbedPosX, setGrabbedPosX] = useState('0px');
  const [grabbedPosY, setGrabbedPosY] = useState('0px'); 


  const drawTiles = () => {
    const numTiles = 7 - playerTiles.length;
    setPlayerTiles([...playerTiles].concat(tileBag.slice(0, numTiles)));
    setTileBag([...tileBag].slice(numTiles));
  }

  const grabTile = (tile, position, fromRack) => {
    setGrabbedTile({
      tile,
      position,
      fromRack
    });
  }

  const moveGrabbedTile = (x, y) => {
    setGrabbedPosX(`${x - 20}px`);
    setGrabbedPosY(`${y - 20}px`);
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
      console.log(updatedPlayerTiles);
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
        <GrabbedTile tile={grabbedTile.tile} style={{top:grabbedPosY, left:grabbedPosX}} />
      : null }
     <button onClick={e => drawTiles()}>Start Game</button>
    </div>
  )
};

export default Game;