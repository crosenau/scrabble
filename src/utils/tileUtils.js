import { remove } from "lodash";
const { floor, random } = Math; 

const createTile = (
  letter, 
  points,
  className = 'tile',
  totalPoints = null,
  played = false,
  dragPosX = null,
  dragPosY = null
) => {
  return {
    letter,
    points,
    className,
    totalPoints,
    played,
    dragPosX,
    dragPosY
  };
};

const allTiles = [
  { letter: null, points: 0, numTiles: 2 },
  { letter: 'A', points: 1, numTiles: 9 },
  { letter: 'B', points: 3, numTiles: 2 },
  { letter: 'C', points: 3, numTiles: 2 },
  { letter: 'D', points: 2, numTiles: 4 },
  { letter: 'E', points: 1, numTiles: 12 },
  { letter: 'F', points: 4, numTiles: 2 },
  { letter: 'G', points: 2, numTiles: 3 },
  { letter: 'H', points: 4, numTiles: 2 },
  { letter: 'I', points: 1, numTiles: 9 },
  { letter: 'J', points: 8, numTiles: 1 },
  { letter: 'K', points: 5, numTiles: 1 },
  { letter: 'L', points: 1, numTiles: 4 },
  { letter: 'M', points: 3, numTiles: 2 },
  { letter: 'N', points: 1, numTiles: 6 },
  { letter: 'O', points: 1, numTiles: 8 },
  { letter: 'P', points: 3, numTiles: 2 },
  { letter: 'Q', points: 10, numTiles: 1 },
  { letter: 'R', points: 1, numTiles: 6 },
  { letter: 'S', points: 1, numTiles: 4 },
  { letter: 'T', points: 1, numTiles: 6 },
  { letter: 'U', points: 1, numTiles: 4 },
  { letter: 'V', points: 4, numTiles: 2 },
  { letter: 'W', points: 4, numTiles: 2 },
  { letter: 'X', points: 8, numTiles: 1 },
  { letter: 'Y', points: 4, numTiles: 2 },
  { letter: 'Z', points: 10, numTiles: 1 },
];

const createTileBag = () => {
  console.log('createTileBag')
  const tiles = allTiles.map(tile => { return {...tile} });
  const bag = [];

  while (tiles.length > 0) {
    const tile = floor(random() * tiles.length);

    if (tiles[tile].numTiles > 0) {
      bag.push(createTile(tiles[tile].letter, tiles[tile].points));
      tiles[tile].numTiles--;
    } else {
      tiles.splice(tile, 1);
    }
  }

  //console.log('bag', bag);

  return bag;
};

const createTestBag = () => {
  const bag = [];
  // Testing
  bag.push(createTile(allTiles[16].letter, allTiles[16].points));
  bag.push(createTile(allTiles[12].letter, allTiles[12].points));
  bag.push(createTile(allTiles[1].letter, allTiles[1].points));
  bag.push(createTile(allTiles[14].letter, allTiles[14].points));
  bag.push(createTile(allTiles[20].letter, allTiles[20].points));
  bag.push(createTile(allTiles[5].letter, allTiles[5].points));
  bag.push(createTile(allTiles[0].letter, allTiles[0].points));

  return bag;
}

const getAllTiles = () => {
  const letters = [];
  for (let x = 1; x < allTiles.length; x++) {
    letters.push(createTile(allTiles[x].letter, null));
  }

  return letters;
}

const drawTiles = (tileBag, rack) => {
  console.log('drawTiles')
  const maxTiles = 7;
  let newRack = rack.filter(tile => tile !== null);
  
  const numTiles = maxTiles - newRack.length;
  newRack = newRack.concat(tileBag.slice(0, numTiles));

  return [tileBag.slice(numTiles), newRack]
};

export { createTileBag, createTestBag, getAllTiles, drawTiles };