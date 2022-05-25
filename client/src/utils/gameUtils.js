import { findLastIndex, pull } from 'lodash'
const { floor, min, random } = Math; 

// Tiles
const createTile = (
  letter, 
  points = null,
  className = 'tile',
  totalPoints = null,
  playedTurn = null,
  dragPosX = null,
  dragPosY = null
) => {
  return {
    letter,
    points,
    className,
    totalPoints,
    playedTurn,
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

  bag.push(createTile(allTiles[16].letter, allTiles[16].points));
  bag.push(createTile(allTiles[12].letter, allTiles[12].points));
  bag.push(createTile(allTiles[1].letter, allTiles[1].points));
  bag.push(createTile(allTiles[14].letter, allTiles[14].points));
  bag.push(createTile(allTiles[20].letter, allTiles[20].points));
  bag.push(createTile(allTiles[5].letter, allTiles[5].points));
  bag.push(createTile(allTiles[0].letter, allTiles[0].points));

  bag.push(createTile(allTiles[16].letter, allTiles[16].points));
  bag.push(createTile(allTiles[12].letter, allTiles[12].points));
  bag.push(createTile(allTiles[1].letter, allTiles[1].points));
  bag.push(createTile(allTiles[14].letter, allTiles[14].points));

  return bag;
}

const getAllTiles = () => {
  const letters = [];
  for (let x = 1; x < allTiles.length; x++) {
    letters.push(createTile(allTiles[x].letter));
  }

  return letters;
}

/**
 * Refill player's tiles by pulling from tilebag. Modifies input arrays.
 * @param {Array} tileBag
 * @param {Array} playerTiles
 */
const drawTiles = (tileBag, playerTiles) => {
  console.log('drawTiles')
  const maxTiles = 7;

  pull(playerTiles, null);
  const numTiles = maxTiles - playerTiles.length;
  playerTiles.push(...tileBag.splice(0, numTiles));
};

// Board
const cellTypes = [
  {    
    className: 'board__cell',
    text: null,
    letterScoreMod: null,
    wordScoreMod: null,
    index: null,
    tile: null
  },
  {
    className: 'board__cell-center',
    text: null,
    letterScoreMod: null,
    wordScoreMod: 2,
    index: null,
    tile: null
  },
  {
    className: 'board__cell-triple-word',
    text: 'TW',
    letterScoreMod: null,
    wordScoreMod: 3,
    index: null,
    tile: null
  },
  {
    className: 'board__cell-double-word',
    text: 'DW',
    letterScoreMod: null,
    wordScoreMod: 2,
    index: null,
    tile: null
  },
  {
    className: 'board__cell-triple-letter',
    text: 'TL',
    letterScoreMod: 3,
    wordScoreMod: null,
    index: null,
    tile: null
  },
  {
    className: 'board__cell-double-letter',
    text: 'DL',
    letterScoreMod: 2,
    wordScoreMod: null,
    index: null,
    tile: null
  }
];

const createEmptyBoard = () => {
  const [a, b, c, d, e, f] = cellTypes;
  let board = [
    [c, a, a, f, a, a, a, c, a, a, a, f, a, a, c],
    [a, d, a, a, a, e, a, a, a, e, a, a, a, d, a],
    [a, a, d, a, a, a, f, a, f, a, a, a, d, a, a],
    [f, a, a, d, a, a, a, f, a, a, a, d, a, a, f],
    [a, a, a, a, d, a, a, a, a, a, d, a, a, a, a],
    [a, e, a, a, a, e, a, a, a, e, a, a, a, e, a],
    [a, a, f, a, a, a, f, a, f, a, a, a, f, a, a],
    [c, a, a, f, a, a, a, b, a, a, a, f, a, a, c],
    [a, a, f, a, a, a, f, a, f, a, a, a, f, a, a],
    [a, e, a, a, a, e, a, a, a, e, a, a, a, e, a],
    [a, a, a, a, d, a, a, a, a, a, d, a, a, a, a],
    [f, a, a, d, a, a, a, f, a, a, a, d, a, a, f],
    [a, a, d, a, a, a, f, a, f, a, a, a, d, a, a],
    [a, d, a, a, a, e, a, a, a, e, a, a, a, d, a],
    [c, a, a, f, a, a, a, c, a, a, a, f, a, a, c],
  ];

  board.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      board[rowIndex][cellIndex] = {
        ...cell,
        index: (rowIndex * row.length) + cellIndex
      };
    })
  });

  return board;
};

const boardSize = 15;

/**
 * Convert a cell's index to a 2d coordinate [row, colum] on board
 * @param {Number} index 
 * @returns 
 */
const get2dPos = (index) => [floor(index / boardSize), index % boardSize];

/**
 * Determines if unplayed words are placed in valid positions
 * @param {Array} board 
 * @returns {Boolean}
 */
const isValidPlacement = (board) => {
  // Check that center tile is filled
  if (!board[7][7].tile) {
    console.log('Center cell is not filled');
    return false;
  }
  const rowsWithNewTiles = board.reduce((allRows, row) => {
    if (row.some(cell => cell.tile !== null && cell.tile.playedTurn === null)) {
      return [...allRows, row]
    }
    return allRows;
  }, []);
  const transposedBoard = board[0].map((_, colIndex) => (
    board.map(row => row[colIndex])));
  const colsWithNewTiles = transposedBoard.reduce((allCols, col) => {
    if (col.some(cell => cell.tile !== null && cell.tile.playedTurn === null)) {
      return [...allCols, col]
    }
    return allCols;
  }, []);

  if (min(rowsWithNewTiles.length, colsWithNewTiles.length) > 1) {
    console.log('pieces must be placed in a single line');
    return false;
  }
  
  const largestLine = rowsWithNewTiles.length > colsWithNewTiles.length ?
    colsWithNewTiles[0]: rowsWithNewTiles[0];
  const start = largestLine.findIndex(cell => cell.tile && cell.tile.playedTurn === null);
  const end = findLastIndex(largestLine, (cell) => cell.tile && cell.tile.playedTurn === null);

  if (largestLine.slice(start, end).some(cell => !cell.tile)) {
    console.log('pieces must be placed to form a single word');
    return false;
  }

  console.log('valid move');
  return true;
};

/**
 * Return all rows and columns containing multiple tiles with at least one that is unplayed.
 * @param {Array} board
 * @returns [Array]
 */
const getPlayableWords = (board) => {
  console.log('getPlayableWords');
  const extractPlayedWords = (line) => {
    const words = [];
    let potentialWord = [];
    let containsUnplayedTile = false;

    line.forEach((cell, i) => {
      if (cell.tile === null) {
        if (potentialWord.length > 1 && containsUnplayedTile) {
          words.push(potentialWord);
        }
        potentialWord = [];
        containsUnplayedTile = false;
      } else if (cell.tile !== null) {
        if (!cell.tile.playedTurn) {
          containsUnplayedTile = true;
        }
        potentialWord.push(cell);
      }
      if (
        i === boardSize - 1 
        && potentialWord.length > 1 
        && containsUnplayedTile
      ) {
          words.push(potentialWord);
      }
    });
    return words;
  };

  let playableWords = [];
  board.forEach(row => {
    const words = extractPlayedWords(row);
    if (words.length > 0) {
      playableWords.push(words.flat());
    }
  });
  const transposedBoard = board[0].map((_, colIndex) => (
    board.map(row => row[colIndex])));
  transposedBoard.forEach(row => {
    const words = extractPlayedWords(row);
    if (words.length > 0) {
      playableWords.push(words.flat());
    }
  });
  return playableWords;
};

const getPlacedTiles = (board) => {
  const cells = board.flat().map(cell => {
    if (cell.tile) {
      return { tile: cell.tile, index: cell.index };
    }

    return null;
  }).filter(cell => cell !== null);

  return cells;
}

const addTilesToBoard = (cells, board) => {
  for (let cell of cells) {
    const [y, x] = get2dPos(cell.index);
    board[y][x].tile = cell.tile;
  }

  return board;
}

/**
 * Remove unplayed tiles from board and return them to player's tiles. Modifies input arrays.
 * @param {array} board 
 * @param {array} playerTiles 
 */
const recallTilesFromBoard = (board, playerTiles) => {
  const lastPlayedTurn = board
    .flat()
    .map(cell => cell.tile ? cell.tile.playedTurn : 0)
    .reduce((a, b) => a > b ? a : b);

  board.forEach(row => {
    row.forEach(cell => {
      if (cell.tile) {
        // Reset classNames for tiles marked as invalid
        if (cell.tile.playedTurn !== null && cell.tile.className === 'tile--invalid') {
          if (cell.tile.playedTurn === lastPlayedTurn) {
              cell.tile.className = 'tile--scored';
          } else {
            cell.tile.className = 'tile--played';
          }
        } else if (cell.tile.playedTurn === null) {
            const insertIndex = playerTiles.indexOf(null);
            playerTiles[insertIndex] = cell.tile;
            cell.tile = null;
          }
      }
    })
  });

  playerTiles.forEach(tile => {
    if (!tile) return;
    tile.letter = tile.points === 0 ? '' : tile.letter;
    tile.className = 'tile';
  });
}

export {
  createTileBag,
  createTestBag,
  getAllTiles,
  drawTiles,
  createEmptyBoard,
  get2dPos,
  isValidPlacement,
  getPlayableWords,
  getPlacedTiles,
  addTilesToBoard,
  recallTilesFromBoard
};