import './game.scss';

export default function Tile({ tile, style }) {
    return (
      <div 
        className={tile.className}
        style={style}
      >
        <div className={tile.totalPoints ? "tile__total-points" : null}>
          {tile.totalPoints}
        </div>
        <div className="tile__letter">
          {tile.letter}
        </div>
        <div className="tile__points">
          {tile.points}
        </div>
      </div>
    );
}
