class Node {
  constructor() {
    this.children = new Map();
    this.end = false;
  }

  setEnd() {
    this.end = true;
  }

  isEnd() {
    return this.end;
  }
}

export default class Trie {
  constructor(words) {
    this.root = new Node();
    this.size = 0;

    if (words) {
      for (let word of words) {
        this.add(word.toUpperCase());
      }
    }
  }

  add(word, node = this.root) {
    if (word.length === 0 && node !== this.root) {
      node.setEnd();
      return;
    }

    if (!node.children.has(word[0])) {
      node.children.set(word[0], new Node())
      this.size++;
    }

    this.add(word.slice(1), node.children.get(word[0]));
  }

  /**
   * Returns true if a given word is a complete word in the trie.
   * @param {String} word 
   * @returns 
   */
  isWord(word, node = this.root) {
    if (word.length === 0) {
      return node.isEnd();
    }

    if (!node.children.has(word[0])) {
      return false;
    }

    return this.isWord(word.slice(1), node.children.get(word[0]));
  }
  
  print(node = this.root, currentWord = "", wordList = []) {
    if (node.isEnd() === true) {
      wordList.push(currentWord);
    }

    for (let key of node.children.keys()) {
      if (key) {
        wordList = this.print(node.children.get(key), currentWord + key, wordList);
      }
    }

    return wordList;
  }

  /**
   * Returns the last node for a given input word.
   * @param {String} word 
   * @returns 
   */
  lookup(word, node = this.root) {
    if (word.length === 0) {
      return node;
    }

    if (!node.children.has(word[0])) {
      return null;
    }

    return this.lookup(word.slice(1), node.children.get(word[0]));
  }
}
