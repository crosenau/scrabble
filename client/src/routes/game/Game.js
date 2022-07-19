import { useState } from 'react';
import BoardView from './BoardView';
import Rack from './Rack';
import Tile from './Tile';
import GreenButton from '../../components/GreenButton';
import PlayerList from './PlayerList';
import LetterSelection from './LetterSelection';
import Lookup from './Lookup';
import useGame from '../../hooks/useGame.js';
import './game.scss';

export default function Game() {  
  const {
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
  } = useGame();

  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0});

  const grabbedTileOffset = Math.min(window.innerWidth, window.innerHeight) / 30;

  // Input handling
  const pointerMoveHandler = (event) => {
    setPointerPos({
      x: event.clientX,
      y: event.clientY
    });
  }

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
  
  const isReady = tileBag !== null;

  if (!isReady) {
    console.log('not ready')
    return <div className="game">Loading...</div>
  }
  
  return (
    <div 
      className="game"
      onPointerDown={pointerDownHandler}
      onPointerMove={pointerMoveHandler}
      onPointerUp={pointerUpHandler}
    >
      <div className="game__section-1">
        <PlayerList 
          players={players}
          turns={turns}
          gameOver={gameOver}
        />
        <div className="game__info">
          <div>Tiles: {tileBag.length}</div>
          <div>Turn: {turns+1}</div>
        </div>
        <Lookup dictionary={dictionary}/>
        <div className="turn-buttons">
          <GreenButton 
              label="Best Word" 
              type="button" 
              onClick={bestWord} 
              disabled={!isPlayersTurn || players[playerIndex].bestWords < 1}
          />
          <GreenButton 
            label="Skip" 
            type="button" 
            onClick={skipTurn} 
            disabled={!isPlayersTurn} 
          />
          { isTradingTiles
            ? <GreenButton 
                label="Confirm" 
                type="button" 
                onClick={tradeSelectedTiles} 
                disabled={!isPlayersTurn}
              />
            : <GreenButton 
                label="Trade" 
                type="button" 
                onClick={toggleIsTradingTiles} 
                disabled={!isPlayersTurn}
              />
          }
          <GreenButton 
            label="Play" 
            type="button" 
            onClick={playWords} disabled={!isPlayersTurn}
          />
        </div>
      </div>
      <div className="game__section-2">
        <BoardView 
          cells={cells}
          players={players}
          turns={turns}
          isPlayersTurn
        />
        <Rack rack={players[playerIndex].tiles}/>
        <div className="tile-buttons">
          <GreenButton 
            label="Recall" 
            type="button" 
            onClick={recallTiles} disabled={!isPlayersTurn}
          />
          <GreenButton 
            label="Shuffle" 
            type="button" 
            onClick={shuffleTiles} 
          />
        </div>
      </div>
      { grabbedTile ? (
        <Tile
          tile={grabbedTile}
          style={{
            left: pointerPos.x - grabbedTileOffset,
            top: pointerPos.y - grabbedTileOffset, 
          }}
        />
      ) : null }
      { letterSelectVisible ? <LetterSelection selectLetter={selectLetter} /> : null }
    </div>
  );
}
