const cellTypes = [
  {    
    className: 'board__cell',
    text: null,
    letterScoreMod: null,
    wordScoreMod: null,
    pos: null,
    tile: null
  },
  {
    className: 'board__cell-center',
    text: null,
    letterScoreMod: null,
    wordScoreMod: 2,
    pos: null,
    tile: null
  },
  {
    className: 'board__cell-triple-word',
    text: 'TW',
    letterScoreMod: null,
    wordScoreMod: 3,
    pos: null,
    tile: null
  },
  {
    className: 'board__cell-double-word',
    text: 'DW',
    letterScoreMod: null,
    wordScoreMod: 2,
    pos: null,
    tile: null
  },
  {
    className: 'board__cell-triple-letter',
    text: 'TL',
    letterScoreMod: 3,
    wordScoreMod: null,
    pos: null,
    tile: null
  },
  {
    className: 'board__cell-double-letter',
    text: 'DL',
    letterScoreMod: 2,
    wordScoreMod: null,
    pos: null,
    tile: null
  }
];

export default class Board {
  #cells;

  constructor(dictionary) {
    const [a, b, c, d, e, f] = cellTypes;

    this.dictionary = dictionary;
    this.size = 15;
    this.#cells = [
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

    this.#cells.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        this.#cells[rowIndex][cellIndex] = {
          ...cell,
          pos: [rowIndex, cellIndex]
        };
      })
    });
  }

  // This may not be optimal since cells is referenced so often. May be best to just make a copy of cells when setting state.
  copyCells() {
    return this.#cells.map(row => row.map(cell => {
      return {
        ...cell, 
        tile: cell.tile ? { ...cell.tile } : null
      };
    }));
  }

  get transposedCells() {
    return this.#cells[0].map((_, colIndex) => (
      this.#cells.map(row => row[colIndex])));
  }

  resetCells() {
    this.#cells.forEach(row => row.forEach(cell => {
      cell.tile = null;
    }));
  }

  print() {
    console.log('BOARD\n')
    console.log(
      this.#cells.map(row => (
        row.map(cell => cell.tile ? '|' + cell.tile.letter : '|_').join('')
      )).join('\n')
    );
  }

  /**
   * Return a list of all cell coordinates on the board.
   * @returns {Array}
   */
  allPositions() {
    const positions = [];

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        positions.push([y, x]);
      }
    }

    return positions;
  }

  /**
   * Get a cell's tile by either 2d position or index.
   * @param {Array.<Number|Number} pos 
   * @returns 
   */
  getCellTile(pos) {
    const [y, x] = pos;

    return this.#cells[y][x].tile;
  }

  /**
   * Set a cell's tile by either 2d position or index.
   * @param {Array.<Number>|Number} pos 
   * @param {Object} tile 
   */
  setCellTile(pos, tile) {    
    const [y, x] = pos;

    this.#cells[y][x].tile = tile;
  }

  inBounds(pos) {
    const [y, x] = pos;

    return y >= 0 && y < this.size && x >= 0 && x < this.size;
  }

  isEmpty(pos) {
    return this.inBounds(pos) && !this.getCellTile(pos);
  }

  isFilled(pos) {
    return this.inBounds(pos) && !!this.getCellTile(pos);
  }

  /**
   * Create and return a duplicate of the board
   * @returns {Object}
   */
  copy() {
    const newBoard = new Board(this.dictionary);

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const cell = this.#cells[y][x];

        if (cell.tile) {
          newBoard.setCellTile([y, x], {...cell.tile});
        }
      }
    }

    return newBoard;
  }

  /**
   * Determines if unplayed tiles are placed in valid positions
   * @returns {Array<Boolean>} [result, invalidReason]
   */
  isValidPlacement() {
    // Check if any new tiles are placed
    if (!this.#cells.flat().some(cell => cell.tile && cell.tile.playedTurn === null)) {
      return [false, 'You have not placed any tiles.'];
    }

    // Check that center tile is filled
    if (!this.#cells[7][7].tile) {
      return [false, 'Center square must be filled.'];
    }

    const rowsWithNewTiles = this.#cells.reduce((allRows, row) => {
      if (row.some(cell => cell.tile !== null && cell.tile.playedTurn === null)) {
        return [...allRows, row]
      }
      return allRows;
    }, []);
    const colsWithNewTiles = this.transposedCells.reduce((allCols, col) => {
      if (col.some(cell => cell.tile !== null && cell.tile.playedTurn === null)) {
        return [...allCols, col]
      }
      return allCols;
    }, []);

    // Verify that new tiles are only placed on a single line
    if (Math.min(rowsWithNewTiles.length, colsWithNewTiles.length) > 1) {
      return [false, 'Tiles must be placed in a single line.'];
    }

    // Verify that at least one new tile is adjacent to an unplayed tile
    const existingTiles = this.#cells.flat().some(cell => cell.tile !== null && cell.tile.playedTurn !== null);

    if (existingTiles) {
      const adjacentToExistingTile = [...rowsWithNewTiles, ...colsWithNewTiles].some(line => {
        return line.some((_, i) => {
          if (i > 0) {
            if (line[i].tile && line[i-1].tile) {
              return (
                (line[i].tile.playedTurn === null && line[i-1].tile.playedTurn !== null)
                || (line[i].tile.playedTurn !== null && line[i-1].tile.playedTurn === null)
              );
            }
          }
        });
      });
  
      if (!adjacentToExistingTile) {
        return [false, 'New tiles must be connected to an existing tile.'];
      }  
    }
    
    const largestLine = rowsWithNewTiles.length > colsWithNewTiles.length
      ? colsWithNewTiles[0]
      : rowsWithNewTiles[0];
    const start = largestLine.findIndex(cell => cell.tile && cell.tile.playedTurn === null);
    const end = largestLine
      .map(cell => Boolean(cell.tile && cell.tile.playedTurn === null))
      .lastIndexOf(true);

    // Verify that there are no gaps in the played line
    if (largestLine.slice(start, end).some(cell => !cell.tile)) {
      return [false, 'Pieces must be placed to form a single word.'];
    }

    return [true];
  }

  /**
   * Return all rows and columns containing grouped tiles with at least one that is unplayed.
   * @returns {Array} 
   */
  getPlayedWords() {
    let playableWords = [];

    this.#cells.forEach(row => {
      const word = this.getPlayedWordFromLine(row);
      if (word) {
        playableWords.push(word);
      }
    });
        
    this.transposedCells.forEach(row => {
      const word = this.getPlayedWordFromLine(row);
      if (word) {
        playableWords.push(word);
      }
    });

    return playableWords;
  }

  /**
   * Get a group of tiles containing an unplayed tile from a single line
   * Used only by getPlayableWords
   * @param {Array} line 
   * @returns {Array}
   */
  getPlayedWordFromLine(line) {
    let word = null;
    let potentialWord = [];
    let containsUnplayedTile = false;

    line.forEach((cell, i) => {
      if (cell.tile === null) {
        if (potentialWord.length > 1 && containsUnplayedTile) {
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
        i === this.size - 1 
        && potentialWord.length > 1 
        && containsUnplayedTile
      ) {
          word = potentialWord;
      }
    })
    
    return word;
  }

  /**
   * Lookup words in dictionary and return invalid ones
   * @param {Array} words 
   * @returns {Array} invalidWords
   */
  evaluatePlayedWords = (words) => {
    const invalidWords = words.reduce((prevWords, word) => {
      const text = word.map(cell => cell.tile.letter).join('');
      // console.log('isWord ', text, this.dictionary.isWord(text));
      if (!this.dictionary.isWord(text)) {
        return [...prevWords, word]
      }
      return prevWords;
    }, [])

    return invalidWords;
  }

  /**
   * Mark all unplayed tiles as invalid
   * @returns {undefined} 
   */
  markInvalidTiles() {
    this.#cells.forEach(row => {
      row.forEach(cell => {
        if (cell.tile && cell.tile.playedTurn === null) {
          cell.tile.className = 'tile--invalid';
        }
      });
    });
  }

  /**
   * Mark all board tiles from specified words as invalid
   * @param {Array} words 
   */
  markInvalidWords(words) {
    words.forEach(word => {
      const positions = word.map(cell => cell.pos);
      positions.forEach(pos => {
        const tile = this.getCellTile(pos);
        if (tile) tile.className = 'tile--invalid';
      });
    });
  }

  /**
   * Modify input board, marking specified words as scored and return total move points.
   * @param {Array} playedWords 
   * @param {Number} turns 
   * @returns 
   */
  scorePlayedWords = (playedWords, turns, log = false) => {
    // Set className for previously scored tiles
    this.#cells.flat().forEach(cell => {
      if (cell.tile && cell.tile.playedTurn !== null) {
        cell.tile.className = 'tile--played';
        cell.tile.totalPoints = null;
      }
    });

    // Mark newly played tiles and update user's score
    let movePoints = 0;

    playedWords.forEach(word => {
      const positions = word.map(cell => cell.pos);
      const score = this.scoreWord(word, turns);
      
      if (log) console.log(`Scored ${word.map(cell => cell.tile.letter).join('')} for ${score} pts`); 

      positions.forEach((pos, i) => {
        const tile = this.getCellTile(pos);
        if (tile) {
          tile.className = 'tile--scored';
          tile.playedTurn = turns;
          tile.totalPoints = i === positions.length-1
            ? (tile.totalPoints || 0) + score
            : tile.totalPoints;
        }
      });

      movePoints += score;
    });

    return movePoints;
  }

  /**
   * Return the score for an individual word, adding tile points and applying cell modifiers
   * @param {Array} word
   * @param {Number} turns
   * @returns {Number}
   */
  scoreWord = (word, turns) => {
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
      if (cell.tile.playedTurn === null || cell.tile.playedTurn === turns) {
        playedTiles += 1;
      }
    });

    score *= wordScoreMod;
    score += (playedTiles === 7) ? 50 : 0;
    return score;
  }

  /**
   * Modifies input board by removing unplayed tiles and returns them in an array
   * @returns {Array}
   */
  removeUnplayedTiles() {
    const recalledTiles = [];

    this.resetInvalidTiles();
    this.#cells
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
  }

  getFilledCells() {
    const cells = this.#cells
      .flat()
      .map(cell => {
        if (cell.tile) {
          return { tile: cell.tile, pos: cell.pos };
        }
    
        return null;
      }).filter(cell => cell !== null);
  
    return cells;
  }

  /**
   * Resets classNames for all 'invalid' tiles
   */
  resetInvalidTiles() {
    const lastPlayedTurn = this.#cells
      .flat()
      .map(cell => cell.tile ? cell.tile.playedTurn : 0)
      .reduce((a, b) => a > b ? a : b);

    this.#cells.forEach(row => {
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

  /**
   * Finds blank tile in cells and adds a letter to it
   * @param {String} letter 
   */
  setBlankTileLetter(letter) {
    this.#cells.forEach(row => {
      row.forEach(cell => {
        if (cell.tile && cell.tile.letter === null) {
          cell.tile.letter = letter;
        }
      });
    });
  }
}
