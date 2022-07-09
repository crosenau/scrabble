import Trie from './trie.js'
import wordList from './wordList.json'

const dictionary = new Trie(wordList);

const isWord = (word) => {
  return dictionary.isWord(word.toUpperCase());
}

export { isWord };