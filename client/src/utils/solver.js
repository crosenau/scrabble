export default class Solver {
  constructor(dictionary, board, rack) {
    this.dictionary = dictionary;
    this.board = board;
    this.rackLetters = rack.map(tile => tile.letter);

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
    console.log('found a word: ', word);

    const newBoard = this.board.copy();
    const moveData = {
      letters: [],
      positions: [],
      movePoints: 0,
    };
    let playPos = lastPos;
    let wordIndex = word.length - 1;

    while (wordIndex >= 0) {      
      newBoard.setCellTile(playPos, {...tiles[word[wordIndex]]});
      moveData.letters.push(word[wordIndex]);
      moveData.positions.push(playPos);
      wordIndex--;
      playPos = this.before(playPos);
    }

    const validPlacement = newBoard.isValidPlacement();
    const playedWords = newBoard.getPlayedWords();

    if (!validPlacement || playedWords.length === 0) {
      console.error('Invalid Move');
      return;
    }

    // Need to have access to turns to use for this
    moveData.movePoints = newBoard.scorePlayedWords(playedWords, 0);
    
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
        if (this.rackLetters.includes(nextLetter)) {
          const rackIndex = this.rackLetters.indexOf(nextLetter);
          this.rackLetters[rackIndex] = null;
          this.beforePart(
            partialWord + nextLetter,
            currentNode.children.get(nextLetter),
            anchorPos,
            limit - 1
          );
          this.rackLetters[rackIndex] = nextLetter;
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
    if (!this.board.isFilled(nextPos) && currentNode.isEnd() && anchorFilled) {
      this.logMove(partialWord, this.before(nextPos));
    }
    if (this.board.inBounds(nextPos)) {
      if (this.board.isEmpty(nextPos)) {
        for (let nextLetter of currentNode.children.keys()) {
          if (this.rackLetters.includes(nextLetter) && this.crossCheckResults[nextPos].includes(nextLetter)) {
            const rackIndex = this.rackLetters.indexOf(nextLetter);
            this.rackLetters[rackIndex] = null;
            this.extendAfter(
              partialWord + nextLetter,
              currentNode.children.get(nextLetter),
              this.after(nextPos),
              true
            );

            this.rackLetters[rackIndex] = nextLetter;
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

  findAllOptions() {
    for (let direction of ['across', 'down']) {
      this.direction = direction;
      let anchors = this.findAnchors();
      this.crossCheckResults = this.crossCheck();
      for (let anchorPos of anchors) {
        let partialWord = '';
        // If there are placed tiles just before the anchor, use those to start a word and extend it from there.
        if (this.board.isFilled(this.before(anchorPos))) {
          let scanPos = this.before(anchorPos);
          partialWord = this.board.getCellTile(scanPos).letter + partialWord;
          while (this.board.isFilled(scanPos)) {
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
            // console.log(limit);
            scanPos = this.before(scanPos);
          }
          this.beforePart('', this.dictionary.root, anchorPos, limit);
        }
      }
    }

    //console.log(JSON.stringify(this.allMoves, null, 2));
    return this.allMoves;
  }
}
