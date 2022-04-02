import { findLastIndex, pull } from 'lodash'
const { floor, min, random } = Math; 

// Tiles
const createTile = (
  letter, 
  points = null,
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
const createSquare = ({ className, text, letterScoreMod, wordScoreMod, index }) => {
  return {
    className,
    text,
    letterScoreMod,
    wordScoreMod,
    tile: null,
    index
  };
};

// Square types
const normal = (i) => {
  return createSquare({
    className: 'board__square',
    text: null,
    letterScoreMod: null,
    wordScoreMod: null,
    index: i
  });
};
const center = (i) => {
  return createSquare({
    className: 'board__square-center',
    text: null,
    letterScoreMod: null,
    wordScoreMod: 2,
    index: i
  });
};
const tripleWord = (i) => {
  return createSquare({
    className: 'board__square-triple-word',
    text: 'TW',
    letterScoreMod: null,
    wordScoreMod: 3,
    index: i
  });
};
const doubleWord = (i) => {
  return createSquare({
    className: 'board__square-double-word',
    text: 'DW',
    letterScoreMod: null,
    wordScoreMod: 2,
    index: i
  });
};
const tripleLetter = (i) => {
  return createSquare({
    className: 'board__square-triple-letter',
    text: 'TL',
    letterScoreMod: 3,
    wordScoreMod: null,
    index: i
  });
};
const doubleLetter = (i) => {
  return createSquare({
    className: 'board__square-double-letter',
    text: 'DL',
    letterScoreMod: 2,
    wordScoreMod: null,
    index: i
  });
};

// Length of rows and columns of board (15x15)
const boardSize = 15;

const createEmptyBoard = () => {
  let board = [
    [tripleWord, normal, normal, doubleLetter, normal, normal, normal, tripleWord, normal, normal, normal, doubleLetter, normal, normal, tripleWord],
    [normal, doubleWord, normal, normal, normal, tripleLetter, normal, normal, normal, tripleLetter, normal, normal, normal, doubleWord, normal],
    [normal, normal, doubleWord, normal, normal, normal, doubleLetter, normal, doubleLetter, normal, normal, normal, doubleWord, normal, normal],
    [doubleLetter, normal, normal, doubleWord, normal, normal, normal, doubleLetter, normal, normal, normal, doubleWord, normal, normal, doubleLetter],
    [normal, normal, normal, normal, doubleWord, normal, normal, normal, normal, normal, doubleWord, normal, normal, normal, normal],
    [normal, tripleLetter, normal, normal, normal, tripleLetter, normal, normal, normal, tripleLetter, normal, normal, normal, tripleLetter, normal],
    [normal, normal, doubleLetter, normal, normal, normal, doubleLetter, normal, doubleLetter, normal, normal, normal, doubleLetter, normal, normal],
    [tripleWord, normal, normal, doubleLetter, normal, normal, normal, center, normal, normal, normal, doubleLetter, normal, normal, tripleWord],
    [normal, normal, doubleLetter, normal, normal, normal, doubleLetter, normal, doubleLetter, normal, normal, normal, doubleLetter, normal, normal],
    [normal, tripleLetter, normal, normal, normal, tripleLetter, normal, normal, normal, tripleLetter, normal, normal, normal, tripleLetter, normal],
    [normal, normal, normal, normal, doubleWord, normal, normal, normal, normal, normal, doubleWord, normal, normal, normal, normal],
    [doubleLetter, normal, normal, doubleWord, normal, normal, normal, doubleLetter, normal, normal, normal, doubleWord, normal, normal, doubleLetter],
    [normal, normal, doubleWord, normal, normal, normal, doubleLetter, normal, doubleLetter, normal, normal, normal, doubleWord, normal, normal],
    [normal, doubleWord, normal, normal, normal, tripleLetter, normal, normal, normal, tripleLetter, normal, normal, normal, doubleWord, normal],
    [tripleWord, normal, normal, doubleLetter, normal, normal, normal, tripleWord, normal, normal, normal, doubleLetter, normal, normal, tripleWord],
  ];

  board.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      board[rowIndex][colIndex] = square((rowIndex * boardSize) + colIndex);
    })
  })

  return board;
};

/**
 * Convert a square's index to a 2d coordinate [row, colum] on board
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
  console.log('isValidPlacement');
  // Check that center tile is filled
  if (!board[7][7].tile) {
    console.log('Center square is not filled');
    return false;
  }
  const rowsWithNewTiles = board.reduce((allRows, row) => {
    if (row.some(square => square.tile !== null && !square.tile.played)) {
      return [...allRows, row]
    }
    return allRows;
  }, []);
  const transposedBoard = board[0].map((_, colIndex) => (
    board.map(row => row[colIndex])));
  const colsWithNewTiles = transposedBoard.reduce((allCols, col) => {
    if (col.some(square => square.tile !== null && !square.tile.played)) {
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
  const start = largestLine.findIndex(square => square.tile && !square.tile.played);
  const end = findLastIndex(largestLine, (square) => square.tile && !square.tile.played);

  if (largestLine.slice(start, end).some(square => !square.tile)) {
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

    line.forEach((square, i) => {
      if (square.tile === null) {
        if (potentialWord.length > 1 && containsUnplayedTile) {
          words.push(potentialWord);
        }
        potentialWord = [];
        containsUnplayedTile = false;
      } else if (square.tile !== null) {
        if (!square.tile.played) {
          containsUnplayedTile = true;
        }
        potentialWord.push(square);
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

/**
 * Return an array of 2d coordinates [row, column] for all board squares containing newly placed tiles.
 * @param {Array} board 
 * @returns Array
 */
const getUnplayedTileCoords = (board) => {
  let unplayedTileCoords = [];
  for (let row=0; row < board.length; row++) {
    for (let col=0; col < board[row].length; col++) {
      if (board[row][col].tile !== null && !board[row][col].tile.played) {
        unplayedTileCoords.push([row, col]);
      }
    }
  }
  return unplayedTileCoords;
};

/**
 * Filter board squares based on a filter function and then edit them based on an edit function.
 * @param {array} board 
 * @param {function} filter 
 * @param {function} edit 
 */
const editBoardByFilter = (board, filter, edit) => {
  for (let row of board) {
    for (let square of row) {
      if (filter(square) === true) {
        edit(square);
      }
    }
  }
}

const editBoardByIndices = (board, indices, edit) => {
  const iterable = typeof indices === 'number' ? [indices] : indices;
  for (let index of iterable) {
    const pos2d = get2dPos(index);
    edit(board[pos2d[0]][pos2d[1]]);
  }
}

const getPlacedTiles = (board) => {
  const squares = board.flat().map(square => {
    if (square.tile) {
      return { tile: square.tile, index: square.index };
    }

    return null;
  }).filter(square => square !== null);

  return squares;
}

const addTilesToBoard = (squares, board) => {
  for (let square of squares) {
    const [row, col] = get2dPos(square.index);
    board[row][col].tile = square.tile;
  }

  return board;
}

/**
 * Remove unplayed tiles from board and return them to player's tiles. Modifies input arrays.
 * @param {array} board 
 * @param {array} playerTiles 
 */
const recallTilesFromBoard = (board, playerTiles) => {
  board.forEach(row => {
    row.forEach(square => {
      if (square.tile) {
        if (square.tile.played && square.tile.className === 'tile--invalid') {
          square.tile.className = square.tile.played 
          ? 'tile--played'
          : 'tile'
        } else if (!square.tile.played) {
            const insertIndex = playerTiles.indexOf(null);
            playerTiles[insertIndex] = square.tile;
            square.tile = null;
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
  getUnplayedTileCoords,
  editBoardByFilter,
  editBoardByIndices,
  getPlacedTiles,
  addTilesToBoard,
  recallTilesFromBoard
};