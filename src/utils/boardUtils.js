const {floor } = Math; 

const createSquare = ({ className, text, scoreMultiplier, modFullWord }) => {
  return {
    className: [className],
    text: [text],
    scoreMultiplier: [scoreMultiplier],
    modFullWord: [modFullWord],
    tile: null,
    addTile( text, points ) {
      this.tile = {
        text: [text],
        points: [points]
      }
    },
    removeTile() {
      this.tile = null;
    }
  };
};

// Square types
const normal = () => {
  return createSquare({
    className: 'square',
    text: null,
    scoreMultiplier: 1,
    modFullWord: false,
  });
};
const center = () => {
  return createSquare({
    className: 'square-center',
    text: null,
    scoreMultiplier: 1,
    modFullWord: false,
  });
};
const tripleWord = () => {
  return createSquare({
    className: 'square-triple-word',
    text: 'TW',
    scoreMultiplier: 3,
    modFullWord: true,
  });
};
const doubleWord = () => {
  return createSquare({
    className: 'square-double-word',
    text: 'DW',
    scoreMultiplier: 2,
    modFullWord: true,
  });
};
const tripleLetter = () => {
  return createSquare({
    className: 'square-triple-letter',
    text: 'TL',
    scoreMultiplier: 3,
    modFullWord: false,
  });
};
const doubleLetter = () => {
  return createSquare({
    className: 'square-double-letter',
    text: 'DL',
    scoreMultiplier: 3,
    modFullWord: false,
  });
};

const createEmptyBoard = () => {
  return [
    [tripleWord(), normal(), normal(), doubleLetter(), normal(), normal(), normal(), tripleWord(), normal(), normal(), normal(), doubleLetter(), normal(), normal(), tripleWord()],
    [normal(), doubleWord(), normal(), normal(), normal(), tripleLetter(), normal(), normal(), normal(), tripleLetter(), normal(), normal(), normal(), doubleWord(), normal()],
    [normal(), normal(), doubleWord(), normal(), normal(), normal(), doubleLetter(), normal(), doubleLetter(), normal(), normal(), normal(), doubleWord(), normal(), normal()],
    [doubleLetter(), normal(), normal(), doubleWord(), normal(), normal(), normal(), doubleLetter(), normal(), normal(), normal(), doubleWord(), normal(), normal(), doubleLetter()],
    [normal(), normal(), normal(), normal(), doubleWord(), normal(), normal(), normal(), normal(), normal(), doubleWord(), normal(), normal(), normal(), normal()],
    [normal(), tripleLetter(), normal(), normal(), normal(), tripleLetter(), normal(), normal(), normal(), tripleLetter(), normal(), normal(), normal(), tripleLetter(), normal()],
    [normal(), normal(), doubleLetter(), normal(), normal(), normal(), doubleLetter(), normal(), doubleLetter(), normal(), normal(), normal(), doubleLetter(), normal(), normal()],
    [tripleWord(), normal(), normal(), doubleLetter(), normal(), normal(), normal(), center(), normal(), normal(), normal(), doubleLetter(), normal(), normal(), tripleWord()],
    [normal(), normal(), doubleLetter(), normal(), normal(), normal(), doubleLetter(), normal(), doubleLetter(), normal(), normal(), normal(), doubleLetter(), normal(), normal()],
    [normal(), tripleLetter(), normal(), normal(), normal(), tripleLetter(), normal(), normal(), normal(), tripleLetter(), normal(), normal(), normal(), tripleLetter(), normal()],
    [normal(), normal(), normal(), normal(), doubleWord(), normal(), normal(), normal(), normal(), normal(), doubleWord(), normal(), normal(), normal(), normal()],
    [doubleLetter(), normal(), normal(), doubleWord(), normal(), normal(), normal(), doubleLetter(), normal(), normal(), normal(), doubleWord(), normal(), normal(), doubleLetter()],
    [normal(), normal(), doubleWord(), normal(), normal(), normal(), doubleLetter(), normal(), doubleLetter(), normal(), normal(), normal(), doubleWord(), normal(), normal()],
    [normal(), doubleWord(), normal(), normal(), normal(), tripleLetter(), normal(), normal(), normal(), tripleLetter(), normal(), normal(), normal(), doubleWord(), normal()],
    [tripleWord(), normal(), normal(), doubleLetter(), normal(), normal(), normal(), tripleWord(), normal(), normal(), normal(), doubleLetter(), normal(), normal(), tripleWord()],
  ];
};

const get2dPos = (index) => [floor(index / 15), index % 15];

export { createEmptyBoard, get2dPos };