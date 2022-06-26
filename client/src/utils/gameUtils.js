import { findLastIndex } from 'lodash'
import { isWord } from '../utils/dictionary';
const { floor, min, random } = Math; 

// Tiles
const createTile = (
  letter, 
  points = null,
  className = 'tile',
  totalPoints = null,
  playedTurn = null
) => {
  return {
    letter,
    points,
    className,
    totalPoints,
    playedTurn
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

/**
 * Return a new tile bag filled with standard assortment of tiles
 * @returns {Array}
 */
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

// Testing
const createTestBag = () => {
  const bag = [];

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

/**
 * Get one of every tile with just the letter (for display in TileSelector)
 * @returns {Array}
 */
const getAllTiles = () => {
  const tiles = [];
  for (let x = 1; x < allTiles.length; x++) {
    tiles.push(createTile(allTiles[x].letter));
  }

  return tiles;
}

/**
 * Modify input rack by adding multiple tiles to it, filling empty spaces
 * @param {Array} rack
 * @param {Array} tiles
 */
const addTilesToRack = (rack, tiles) => {  
  tiles.forEach(tile => {
    const insertIndex = rack.indexOf(null);
    rack[insertIndex] = tile;
  });
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

/**
 * Create a new game board with all blank cells
 * @returns {Array}
 */
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
 * @returns {Array}
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

  // Verify that new tiles are only placed on a single line
  if (min(rowsWithNewTiles.length, colsWithNewTiles.length) > 1) {
    console.log('pieces must be placed in a single line');
    return false;
  }
  
  const largestLine = rowsWithNewTiles.length > colsWithNewTiles.length
    ? colsWithNewTiles[0]
    : rowsWithNewTiles[0];
  const start = largestLine.findIndex(cell => cell.tile && cell.tile.playedTurn === null);
  const end = findLastIndex(largestLine, (cell) => cell.tile && cell.tile.playedTurn === null);

  // Verify that there are no gaps in the played line
  if (largestLine.slice(start, end).some(cell => !cell.tile)) {
    console.log('pieces must be placed to form a single word');
    return false;
  }

  console.log('valid move');
  return true;
};

/**
 * Return all rows and columns containing grouped tiles with at least one that is unplayed.
 * @param {Array} board
 * @returns {Array} 
 */
  const getPlayableWords = (board) => {
  console.log('getPlayableWords');

  let playableWords = [];

  board.forEach(row => {
    const word = getPlayedWordFromLine(row);
    if (word) {
      playableWords.push(word);
    }
  });
  
  const transposedBoard = board[0].map((_, colIndex) => (
    board.map(row => row[colIndex])));
  
    transposedBoard.forEach(row => {
    const word = getPlayedWordFromLine(row);
    if (word) {
      playableWords.push(word);
    }
  });

  return playableWords;
};

/**
 * Get a group of tiles containing an unplayed tile from a single line
 * Used only by getPlayableWords
 * @param {Array} line 
 * @returns {Array}
 */
const getPlayedWordFromLine = (line) => {
  // const word = [];
  let word = null;
  let potentialWord = [];
  let containsUnplayedTile = false;

  line.forEach((cell, i) => {
    if (cell.tile === null) {
      if (potentialWord.length > 1 && containsUnplayedTile) {
        // word.push(potentialWord);
        word = potentialWord;
      }
      potentialWord = [];
      containsUnplayedTile = false;
    } else if (cell.tile !== null) {
      if (cell.tile.playedTurn === null) {
        containsUnplayedTile = true;
      }
      potentialWord.push(cell);
    }
    if (
      i === boardSize - 1 
      && potentialWord.length > 1 
      && containsUnplayedTile
    ) {
        // word.push(potentialWord);
        word = potentialWord;
    }
  });
  
  return word;
};

/**
 * Lookup words in dictionary and return invalid ones
 * @param {Array} words 
 * @returns 
 */
const evaluatePlayedWords = (words) => {
  const invalidWords = words.reduce((prevWords, word) => {
    const text = word.map(cell => cell.tile.letter).join('');
    console.log('isWord ', text, isWord(text));
    if (!isWord(text)) {
      return [...prevWords, word]
    }
    return prevWords;
  }, [])

  return invalidWords;
};

/**
 * Modify input board, marking all unplayed tiles as invalid
 * @param {Array} board 
 */
const markInvalidTiles = (board) => {
  board.forEach(row => {
    row.forEach(cell => {
      if (cell.tile && cell.tile.playedTurn === null) {
        cell.tile.className = 'tile--invalid';
      }
    });
  });
};

/**
 * Modify input board, marking all board tiles from specified words as invalid
 * @param {Array} words 
 * @param {Array} board 
 */
const markInvalidWords = (words, board) => {
  words.forEach(word => {
    const text = word.map(cell => cell.tile.letter).join('');
    const indices = word.map(cell => cell.index);
    board.forEach(row => {
      row.forEach(cell => {
        if (cell.tile && indices.includes(cell.index)) {
          cell.tile.className = 'tile--invalid';
        }
      });
    });
  });
};

/**
 * Modify input board, marking specified words as scored and return total move points.
 * @param {Array} playedWords 
 * @param {Array} board 
 * @param {Number} turns 
 * @returns 
 */
const scorePlayedWords = (playedWords, board, turns) => {
  // Set className for previously scored tiles
  board.flat().forEach(cell => {
    if (cell.tile && cell.tile.playedTurn !== null) {
      cell.tile.className = 'tile--played';
      cell.tile.totalPoints = null;
    }
  });

  // Mark newly played tiles and update user's score
  let movePoints = 0;

  playedWords.forEach(word => {
    const indices = word.map(cell => cell.index);
    const score = scoreWord(word, turns);
    console.log(`Scored ${word.map(cell => cell.tile.letter).join('')} for ${score} pts`); 
    board.flat().forEach(cell => {
      if (cell.tile && indices.includes(cell.index)) {
        cell.tile.className = 'tile--scored';
        cell.tile.playedTurn = turns;
        cell.tile.totalPoints = cell.index === indices[indices.length-1]
          ? (cell.tile.totalPoints || 0) + score
          : cell.tile.totalPoints
      }
    });

    movePoints += score;
  });

  return movePoints;
};

/**
 * Return the score for an individual word, adding tile points and applying cell modifiers
 * @param {Array} word
 * @param {Number} turns
 * @returns 
 */
const scoreWord = (word, turns) => {
  let wordScoreMod = 1;
  let score = 0;
  let playedTiles = 0;
  word.forEach(cell => {
    if (
      cell.letterScoreMod 
      && (cell.tile.playedTurn === null || cell.tile.playedTurn === turns)
      ) {
      score += (cell.tile.points * cell.letterScoreMod);
    } else {
      score += cell.tile.points;
    }
    if (
      cell.wordScoreMod 
      && (cell.tile.playedTurn === null || cell.tile.playedTurn === turns)
      ) {
      wordScoreMod = cell.wordScoreMod;
    }
    if (cell.tile.playedTurn === null) {
      playedTiles += 1;
    }
  });

  score *= wordScoreMod;
  score += (playedTiles === 7) ? 50 : 0;
  return score;
};

/**
 * Modifies input board by removing unplayed tiles and returns them in an array
 * @param {Array} board 
 * @returns {Array}
 */
  const removeUnplayedTiles = (board) => {
  const recalledTiles = [];

  resetInvalidTiles(board);
  board
    .flat()
    .forEach(cell => {
      if (cell.tile && cell.tile.playedTurn === null) {
        recalledTiles.push(cell.tile);
        cell.tile = null;
      }
    });

    recalledTiles.forEach(tile => {
      tile.letter = tile.points === 0 ? '' : tile.letter;
      tile.className = 'tile';
    });

  return recalledTiles;
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

/**
 * Modifies board by resetting classNames for all 'invalid' tiles
 * @param {array} board  
 */
const resetInvalidTiles = (board) => {
  const lastPlayedTurn = board
    .flat()
    .map(cell => cell.tile ? cell.tile.playedTurn : 0)
    .reduce((a, b) => a > b ? a : b);

  board.forEach(row => {
    row.forEach(cell => {
      if (cell.tile && cell.tile.className === 'tile--invalid') {
        if (cell.tile.playedTurn === null) {
          cell.tile.className = 'tile';
        } else if (cell.tile.playedTurn === lastPlayedTurn) {
          cell.tile.className = 'tile--scored';
        } else {
          cell.tile.className = 'tile--played';
        }
      }
    });
  });
}

export {
  createTileBag,
  createTestBag,
  getAllTiles,
  createEmptyBoard,
  get2dPos,
  isValidPlacement,
  getPlayableWords,
  getPlacedTiles,
  resetInvalidTiles,
  markInvalidTiles,
  evaluatePlayedWords,
  markInvalidWords,
  scorePlayedWords,
  addTilesToRack,
  removeUnplayedTiles,
  isWord
};
