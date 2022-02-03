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

const createEmptyBoard = () => {
  const board = [
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
      board[rowIndex][colIndex] = square((rowIndex * 15) + colIndex);
    })
  })

  return board;
};

/**
 * Convert a square's index to a 2d position on board
 * @param {Number} index 
 * @returns 
 */
const get2dPos = (index) => [floor(index / 15), index % 15];

export { createEmptyBoard, get2dPos };