const { floor } = Math; 

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
    className: 'square',
    text: null,
    letterScoreMod: null,
    wordScoreMod: null,
    index: i
  });
};
const center = (i) => {
  return createSquare({
    className: 'square-center',
    text: null,
    letterScoreMod: null,
    wordScoreMod: 2,
    index: i
  });
};
const tripleWord = (i) => {
  return createSquare({
    className: 'square-triple-word',
    text: 'TW',
    letterScoreMod: null,
    wordScoreMod: 3,
    index: i
  });
};
const doubleWord = (i) => {
  return createSquare({
    className: 'square-double-word',
    text: 'DW',
    letterScoreMod: null,
    wordScoreMod: 2,
    index: i
  });
};
const tripleLetter = (i) => {
  return createSquare({
    className: 'square-triple-letter',
    text: 'TL',
    letterScoreMod: 3,
    wordScoreMod: null,
    index: i
  });
};
const doubleLetter = (i) => {
  return createSquare({
    className: 'square-double-letter',
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
  let playedTileIndices = [];
  board.forEach((row) => {
    row.forEach((square) => {
      if (square.tile && !square.tile.played) {
        playedTileIndices.push(square.index);
      }
    });
  });
  const validGaps = [1, boardSize];
  let previousGap = null;
  for (let x = 1; x < playedTileIndices.length; x += 1) {
    if (!previousGap) {
      if (!validGaps.includes(playedTileIndices[x] - playedTileIndices[x-1])) {
        console.log('initial difference invalid');
        return false;
      }
    } else if (
      previousGap
      && playedTileIndices[x] - playedTileIndices[x - 1] !== previousGap
    ) {
      console.log('mismatched differences');
      return false;
    }
    previousGap = playedTileIndices[x] - playedTileIndices[x - 1];
  }
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

    line.forEach((square) => {
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
    });
    return words;
  };

  let playableWords = [];
  board.forEach((row) => {
    const words = extractPlayedWords(row);
    if (words.length > 0) {
      playableWords.push(words.flat());
    }
  });
  const transposedBoard = board[0].map((_, colIndex) => (
    board.map((row) => row[colIndex])));
  transposedBoard.forEach((row) => {
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

export {
  createEmptyBoard,
  get2dPos,
  isValidPlacement,
  getPlayableWords,
  getUnplayedTileCoords,
  editBoardByFilter,
  editBoardByIndices
};