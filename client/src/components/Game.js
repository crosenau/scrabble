import { useContext } from 'react';
import Board from './Board';
import Rack from './Rack';
import Tile from './Tile';
import PlayerList from './PlayerList';
import LetterSelection from './LetterSelection';
import { GameContext } from '../contexts/GameContext';

export default function Game() {
  const {
    tileBag,
    grabbedTile,
    letterSelectVisible,
    isTradingTiles,
    moveGrabbedTile,
    playWord,
    skipTurn,
    recallTiles,
    shuffleTiles,
    toggleIsTradingTiles,
    tradeSelectedTiles
  } = useContext(GameContext);

  const isReady = tileBag !== null;
  
  if (!isReady) {
    console.log('not ready')
    return <div className="game">Loading...</div>
  }
  
  return (
    <div className="game" onMouseMove={(e) => moveGrabbedTile(e)}>
      <div className="players">
        <PlayerList />
      </div>
      <div id="table">
        <Board />
        <div id="controls">
          <div id="button-container-1">
            <button type="button" onClick={playWord}>Play</button>
            { isTradingTiles
              ? <button type="button" onClick={tradeSelectedTiles}>Confirm</button>
              : <button type="button" onClick={toggleIsTradingTiles}>Trade</button>
            }

            <button type="button" onClick={skipTurn}>Skip</button>
          </div>
          <Rack />
          <div id="button-container-2">
            <button type="button" onClick={shuffleTiles}>Shuffle</button>
            <button type="button" onClick={recallTiles}>Recall</button>

          </div>
        </div>
      </div>
      { grabbedTile ? (
        <Tile
          tile={grabbedTile}
          style={{ top:grabbedTile.dragPosY, left:grabbedTile.dragPosX }}
        />
      ) : null }
      { letterSelectVisible ? <LetterSelection /> : null }
    </div>
  );
}
