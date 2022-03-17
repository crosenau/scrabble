import { useContext } from 'react';
import Board from './Board';
import Rack from './Rack';
import Tile from './Tile';
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
    tradeSelectedTiles
  } = useContext(GameContext);

  const isReady = tileBag !== null;
  
  if (!isReady) {
    console.log('not ready')
    return <div className="game">Loading...</div>
  }
  
  return (
    <div className="game" onMouseMove={(e) => moveGrabbedTile(e)}>
      <div className="game__players">
        <PlayerList />
      </div>
      <div className="game__interactable">
        <Board />
        <div className="controls">
          <div className="controls__left-buttons">
            <button type="button" onClick={playWords}>Play</button>
            { isTradingTiles
              ? <button type="button" onClick={tradeSelectedTiles}>Confirm</button>
              : <button type="button" onClick={toggleIsTradingTiles}>Trade</button>
            }

            <button type="button" onClick={skipTurn}>Skip</button>
          </div>
          <Rack />
          <div className="controls__right-buttons">
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
