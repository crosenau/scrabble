const GrabbedTile = (props) => {  
  return (
    <div 
      className='tile-grabbed'
      style={props.style}
    >
      <div className='tile-text'>
        {props.tile.text}
      </div>
      <div className='tile-points'>
        {props.tile.points}
      </div>
    </div>
  )
}

export default GrabbedTile;