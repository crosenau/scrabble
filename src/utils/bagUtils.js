const { floor, random } = Math; 

const createTile = (
  text, 
  points, 
  played = false,
  dragPosX = null,
  dragPosY = null
) => {
  return {
    text,
    points,
    played,
    dragPosX,
    dragPosY
  };
};

const allTiles = [
  { text: null, points: 0, numTiles: 2 },
  { text: 'A', points: 1, numTiles: 9 },
  { text: 'B', points: 3, numTiles: 2 },
  { text: 'C', points: 3, numTiles: 2 },
  { text: 'D', points: 2, numTiles: 4 },
  { text: 'E', points: 1, numTiles: 12 },
  { text: 'F', points: 4, numTiles: 2 },
  { text: 'G', points: 2, numTiles: 3 },
  { text: 'H', points: 4, numTiles: 2 },
  { text: 'I', points: 1, numTiles: 9 },
  { text: 'J', points: 8, numTiles: 1 },
  { text: 'K', points: 5, numTiles: 1 },
  { text: 'L', points: 1, numTiles: 4 },
  { text: 'M', points: 3, numTiles: 2 },
  { text: 'N', points: 1, numTiles: 6 },
  { text: 'O', points: 1, numTiles: 8 },
  { text: 'P', points: 3, numTiles: 2 },
  { text: 'Q', points: 10, numTiles: 1 },
  { text: 'R', points: 1, numTiles: 6 },
  { text: 'S', points: 1, numTiles: 4 },
  { text: 'T', points: 1, numTiles: 6 },
  { text: 'U', points: 1, numTiles: 4 },
  { text: 'V', points: 4, numTiles: 2 },
  { text: 'W', points: 4, numTiles: 2 },
  { text: 'X', points: 8, numTiles: 1 },
  { text: 'Y', points: 4, numTiles: 2 },
  { text: 'Z', points: 10, numTiles: 1 },
];

const getTileBag = () => {
  const tiles = allTiles.map(tile => { return {...tile} });
  const bag = [];

  while (tiles.length > 0) {
    const tile = floor(random() * tiles.length);

    if (tiles[tile].numTiles > 0) {
      bag.push(createTile(tiles[tile].text, tiles[tile].points));
      tiles[tile].numTiles--;
    } else {
      tiles.splice(tile, 1);
    }
  }

  //console.log('bag', bag);

  return bag;
};

const getTestBag = () => {
  const bag = [];
  // Testing
  bag.push(createTile(allTiles[16].text, allTiles[16].points));
  bag.push(createTile(allTiles[12].text, allTiles[12].points));
  bag.push(createTile(allTiles[1].text, allTiles[1].points));
  bag.push(createTile(allTiles[14].text, allTiles[14].points));
  bag.push(createTile(allTiles[20].text, allTiles[20].points));
  bag.push(createTile(allTiles[5].text, allTiles[5].points));
  bag.push(createTile(allTiles[0].text, allTiles[0].points));

  return bag;
}

const getLetterSelection = () => {
  const letters = [];

  for (let x = 1; x < allTiles.length; x++) {
    letters.push(allTiles[x])
  }

  return letters;
}

export { getTileBag, getTestBag, getLetterSelection };