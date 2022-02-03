class Node {
  constructor() {
    this.keys = new Map();
    this.end = false;
  }
  setEnd() {
    this.end = true;
  };
  isEnd() {
    return this.end;
  };
}
class Trie {
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
  print(node = this.root, currentWord = "", wordList = []) {
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
};

module.exports = Trie;

/*
// tests
const t1 = new Trie();
let words = ['calculate', 'calendar', 'car', 'cars', 'carpet', 'cat', 'catapult', 'cats', 'dog'];
for (let word of words) {
  t1.add(word);
}

console.log(t1.root.keys.get('d').keys.get('o').keys.get('g'));
for (let word of words) {
  assert(t1.isWord(word) === true);
}
t1.isWord('carpe') === false;
t1.isWord('cata') === false;
t1.isWord('d') === false;
t1.add('');
t1.isWord('') === false;
t1.isWord('ca') === false;
t1.isWord('bfsdff') === false;

console.log(t1.isWord('calendar'));

let results = t1.print();
console.log(results);
results.forEach((word, i) => {
  assert(results[i] === words[i]);
});
*/