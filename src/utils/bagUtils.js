const {floor, random } = Math; 

const createTile = (text, points) => {
  return {
    text: text,
    points: points
  };
};

const createTileBag = () => {
  const tiles = [
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
  const bag = [];

  while (tiles.length > 0) {
    const next = floor(random() * tiles.length);

    if (tiles[next].numTiles > 0) {
      bag.push(createTile(tiles[next].text, tiles[next].points));
      tiles[next].numTiles--;
    } else {
      tiles.splice(next, 1);
    }
  }

  return bag;
};

export default createTileBag;