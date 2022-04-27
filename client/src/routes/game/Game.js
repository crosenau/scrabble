import { useContext } from 'react';
import Board from './Board';
import Rack from './Rack';
import Tile from './Tile';
import GreenButton from '../../components/GreenButton';
import PlayerList from './PlayerList';
import LetterSelection from './LetterSelection';
import { GameContext } from '../../contexts/GameContext';
import './game.scss';

export default function Game() {
  const {
    tileBag,
    grabbedTile,
    letterSelectVisible,
    isTradingTiles,
    moveGrabbedTile,
    playWords,
    skipTurn,
    recallTiles,
    shuffleTiles,
    toggleIsTradingTiles,
    tradeSelectedTiles,
    grabTileFromRack,
    grabTileFromBoard,
    placeTileOnBoard,
    placeTileOnRack,
    selectTile
  } = useContext(GameContext);

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
      onPointerMove={moveGrabbedTile}
      onPointerUp={pointerUpHandler}
    >
      <div className="game__left">
        <PlayerList />
        <div className="turn-buttons">
          <GreenButton label="Skip" type="button" onClick={skipTurn} />
          { isTradingTiles
            ? <GreenButton label="Confirm" type="button" onClick={tradeSelectedTiles} />
            : <GreenButton label="Trade" type="button" onClick={toggleIsTradingTiles} />
          }

          <GreenButton label="Play" type="button" onClick={playWords} />
        </div>
      </div>
      <div className="game__right">
        <Board />
        <Rack />
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
      { letterSelectVisible ? <LetterSelection /> : null }
    </div>
  );
}
