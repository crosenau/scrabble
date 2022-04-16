export default class Trie {
  constructor() {
    this.root = new Node();
    this.size = 0;
  }

  add(word, node = this.root) {
    if (word.length === 0 && node !== this.root) {
      node.setEnd();
      return;
    }

    if (!node.keys.has(word[0])) {
      node.keys.set(word[0], new Node())
      this.size++;
    }

    this.add(word.slice(1), node.keys.get(word[0]));
  }

  isWord(word, node = this.root) {
    if (word.length === 0) {
      return node.isEnd();
    }

    if (!node.keys.has(word[0])) {
      return false;
    }

    return this.isWord(word.slice(1), node.keys.get(word[0]));
  }

  print(node = this.root, currentWord = '', wordList = []) {
    if (node.isEnd() === true) {
      wordList.push(currentWord);
    }

    for (let key of node.keys.keys()) {
      if (key) {
        wordList = this.print(node.keys.get(key), currentWord + key, wordList);
      }
    }

    return wordList;
  }
}

class Node {
  constructor() {
    this.keys = new Map();
    this.end = false;
  }

  setEnd() {
    this.end = true;
  }

  isEnd() {
    return this.end;
  }
}
