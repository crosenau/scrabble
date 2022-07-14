export default class Solver {
  constructor(dictionary, board) {
    this.dictionary = dictionary;
    this.board = board;

    this.rackTiles = []
    this.rackLetters = [];
    this.turns = null;
    this.crossCheckResults = [];
    this.direction = null;
    this.allMoves = [];
  }

  before(pos) {
    const [y, x] = pos;

    if (this.direction === 'across') {
      return [y, x - 1];
    } else {
      return [y - 1, x];
    }
  }

  after(pos) {
    const [y, x] = pos;

    if (this.direction === 'across') {
      return [y, x + 1];
    } else {
      return [y + 1, x];
    }
  }

  beforeCross(pos) {
    const [y, x] = pos;

    if (this.direction === 'across') {
      return [y - 1, x];
    } else {
      return [y, x - 1];
    }
  }

  afterCross(pos) {
    const [y, x] = pos;

    if (this.direction === 'across') {
      return [y + 1, x];
    } else {
      return [y, x + 1];
    }
  }

  logMove(word, lastPos) {
    const newBoard = this.board.copy();
    const moveData = {
      letters: [],
      positions: [],
      movePoints: 0,
    };
    let playPos = lastPos;
    let wordIndex = word.length - 1;

    while (wordIndex >= 0) {
      if (newBoard.getCellTile(playPos) === null) {
        const insertTile = this.rackTiles.find(tile => tile !== null && (tile.letter === word[wordIndex] || tile.letter === null));
        newBoard.setCellTile(
          playPos, 
          { ...insertTile, 
            letter: word[wordIndex]
          }
        );
      }

      moveData.letters.push(word[wordIndex]);
      moveData.positions.push(playPos);
      wordIndex--;
      playPos = this.before(playPos);
    }

    const [validPlacement, reason] = newBoard.isValidPlacement();
    const playedWords = newBoard.getPlayedWords();

    // For some reason crossCheckResults is not always working so we still make sure crosswords are valid here.
    if (!validPlacement || playedWords.length === 0) {
      // console.error(`Invalid Move: ${reason}`);
      return;
    }

    const invalidWords = newBoard.evaluatePlayedWords(playedWords);

    if (invalidWords.length > 0) {
      // console.error(`Invalid Words: ${invalidWords.map(word => word.map(cell => cell.tile.letter).join('')).join(', ')}`);
      return;
    }

    moveData.movePoints = newBoard.scorePlayedWords(playedWords, this.turns);
    
    this.allMoves.push(moveData);
  }

  /**
   * Finds all empty cell positions, precomputes their letter restrictions based on adjacent tiles on the cross axis and returns them.
   * @returns {Object}
   */
  crossCheck() {
    const result = {};

    for (let pos of this.board.allPositions()) {
      if (this.board.isFilled(pos)) {
        continue;
      }

      let lettersBefore = '';
      let scanPos = pos;
      while (this.board.isFilled(this.beforeCross(scanPos))) {
        scanPos = this.beforeCross(scanPos);
        lettersBefore = this.board.getCellTile(scanPos).letter + lettersBefore;
      }
      let lettersAfter = '';
      scanPos = pos;
      while (this.board.isFilled(this.afterCross(scanPos))) {
        scanPos = this.afterCross(scanPos);
        lettersAfter = lettersAfter + this.board.getCellTile(scanPos).letter;
      }

      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      let legalHere = [];

      if (lettersBefore.length === 0 && lettersAfter.length === 0) {
        legalHere = alphabet;
      } else {
        legalHere = [];
        for (let letter of alphabet) {
          let wordFormed = lettersBefore + letter + lettersAfter;
          if (this.dictionary.isWord(wordFormed)) {
            legalHere.push(letter);
          }
        }
      }

      result[pos] = legalHere;
    }

    return result;
  }

  /**
   * Returns an array of positions that are empty and adjacent to placed tiles (a.k.a. the "anchor" positions).
   * @returns {Array}
   */
  findAnchors() {
    let anchors = [];
    for (let pos of this.board.allPositions()) {
      let empty = this.board.isEmpty(pos);
      let neighborFilled = this.board.isFilled(this.before(pos))
        || this.board.isFilled(this.after(pos))
        || this.board.isFilled(this.beforeCross(pos))
        || this.board.isFilled(this.afterCross(pos));

      if (empty && neighborFilled) {
        anchors.push(pos);
      }
    }

    return anchors;
  }

  /**
   * Find all possible parts of words that can be formed before a given anchor 
   * position, and combine them with parts after the anchor.
   * @param {String} partialWord 
   * @param {Object} currentNode 
   * @param {Array.<Number>} anchorPos 
   * @param {Number} limit 
   */
  beforePart(partialWord, currentNode, anchorPos, limit) {    
    this.extendAfter(partialWord, currentNode, anchorPos, false);
    if (limit > 0) {
      for (let nextLetter of currentNode.children.keys()) {
        if (this.rackLetters.some(l => l === nextLetter || l === '.')) {
          const rackIndex = this.rackLetters.indexOf(nextLetter) !== -1 
            ? this.rackLetters.indexOf(nextLetter)
            : this.rackLetters.indexOf('.');
          const storedLetter = this.rackLetters[rackIndex];
          this.rackLetters[rackIndex] = null;
          this.beforePart(
            partialWord + nextLetter,
            currentNode.children.get(nextLetter),
            anchorPos,
            limit - 1
          );
          this.rackLetters[rackIndex] = storedLetter;
        }
      }
    }
  }

  /**
   * Recursively find all possible parts of words that can be formed after a given anchor.
   * @param {String} partialWord 
   * @param {Object} currentNode 
   * @param {Array.<Number>} nextPos 
   * @param {Boolean} anchorFilled 
   */
  extendAfter(partialWord, currentNode, nextPos, anchorFilled) {
    if (this.board.isEmpty(nextPos) && currentNode.isEnd() && anchorFilled) {
      // partialWord === 'JO' && console.log('this shouldn\'t happen');
      this.logMove(partialWord, this.before(nextPos));
    }
    if (this.board.inBounds(nextPos)) {
      if (this.board.isEmpty(nextPos)) {
        for (let nextLetter of currentNode.children.keys()) {
          if (
            this.rackLetters.some(l => l === nextLetter || l === '.') 
            && this.crossCheckResults[nextPos].includes(nextLetter)
            ) {
            const rackIndex = this.rackLetters.indexOf(nextLetter) !== -1 
              ? this.rackLetters.indexOf(nextLetter)
              : this.rackLetters.indexOf('.');
            const storedLetter = this.rackLetters[rackIndex];
            this.rackLetters[rackIndex] = null;
            this.extendAfter(
              partialWord + nextLetter,
              currentNode.children.get(nextLetter),
              this.after(nextPos),
              true
            );

            this.rackLetters[rackIndex] = storedLetter;
          }
        }
      } else {
        const existingLetter = this.board.getCellTile(nextPos).letter;
        if ([...currentNode.children.keys()].includes(existingLetter)) {
          this.extendAfter(
            partialWord + existingLetter,
            currentNode.children.get(existingLetter),
            this.after(nextPos),
            true
          );
        }
      }
    }
  }

  findAllOptions(rack, turns) {
    this.rackTiles = rack;
    this.rackLetters = this.rackTiles.map(tile => {
      if (tile !== null) {
        return tile.letter !== null ? tile.letter : '.';
      }

      return null;
    });
    this.turns = turns;
    this.allMoves = [];

    for (let direction of ['across', 'down']) {
      this.direction = direction;
      const anchors = this.board.getCellTile([7, 7]) === null 
        ? [[7, 7]] // use center square as anchor for first move
        : this.findAnchors();
      this.crossCheckResults = this.crossCheck();
      for (let anchorPos of anchors) {
        let partialWord = '';
        // If there are placed tiles just before the anchor, use those to start a word and extend it from there.
        if (this.board.isFilled(this.before(anchorPos))) {
          let scanPos = this.before(anchorPos);
          partialWord = this.board.getCellTile(scanPos).letter + partialWord;
          while (this.board.isFilled(scanPos) && this.board.inBounds(this.before(scanPos))) {
            scanPos = this.before(scanPos);
            let scannedTile = this.board.getCellTile(scanPos);
            partialWord = scannedTile ? this.board.getCellTile(scanPos).letter + partialWord : partialWord;
          }
          let pwNode = this.dictionary.lookup(partialWord);
          if (pwNode) {
            this.extendAfter(
              partialWord,
              pwNode,
              anchorPos,
              false
            );
          }
        // Otherwise, move as far left/up as possible and start building the word from there.
        } else {
          let limit = 0;
          let scanPos = anchorPos;
          while (this.board.isEmpty(this.before(scanPos)) && !anchors.includes(this.before(scanPos))) {
            limit++;
            scanPos = this.before(scanPos);
          }
          this.beforePart('', this.dictionary.root, anchorPos, limit);
        }
      }
    }

    return this.allMoves.sort((a, b) => b.movePoints - a.movePoints);
  }
}
