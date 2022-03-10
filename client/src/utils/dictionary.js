import Trie from './trie.js'
import wordList from './wordList.json'

const dict = new Trie();

for (let word of wordList) {
  dict.add(word);
}

const isWord = (word) => {
  return dict.isWord(word);
}

export { isWord };