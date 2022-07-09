import Board from './board.js';
import { createTileBag } from './gameUtils.js';

const tiles = createTileBag();

describe('tile placement validation', () => {
  let board;

  beforeEach(() => {
    board = new Board();
  });

  test('move is rejected if no new tiles have been placed', () => {
    expect(board.isValidPlacement()).toEqual([false, 'You have not placed any tiles.']);
  });

  test('move is rejected if no new tiles have been placed but tiles were placed on previous turns', () => {
    board.setCellTile(
      [7, 7], 
      {
        ...tiles.find(t => t.letter = 'H'),
        playedTurn: 0,
        className: 'tile--played'
      }
    );
    board.setCellTile(
      [7, 8], 
      {
        ...tiles.find(t => t.letter = 'I'),
        playedTurn: 0,
        className: 'tile--played',
        totalPoints: 10
      }
    );

    expect(board.isValidPlacement()).toEqual([false, 'You have not placed any tiles.']);
  });

  test('move is rejected if center square is not filled', () => {
    board.setCellTile([8, 8], tiles.find(t => t.letter !== null));

    expect(board.isValidPlacement()).toEqual([false, 'Center square must be filled.']);
  });

  test('move is rejected if multiple new tiles are spread across multiple lines', () => {
    board.setCellTile([7, 7], tiles.find(t => t.letter = 'B'));
    board.setCellTile([7, 8], tiles.find(t => t.letter = 'A'));
    board.setCellTile([7, 9], tiles.find(t => t.letter = 'G'));
    board.setCellTile([8, 8], tiles.find(t => t.letter = 'S'));
    board.setCellTile([8, 9], tiles.find(t => t.letter = 'O'));

    expect(board.isValidPlacement()).toEqual([false, 'Tiles must be placed in a single line.']);
  });

  test('move is rejected if placed tiles are not connected to existing ones', () => {
    board.setCellTile(
      [7, 7], 
      {
        ...tiles.find(t => t.letter = 'H'),
        playedTurn: 0,
        className: 'tile--played'
      }
    );
    board.setCellTile(
      [7, 8], 
      {
        ...tiles.find(t => t.letter = 'I'),
        playedTurn: 0,
        className: 'tile--played',
        totalPoints: 10
      }
    );
    board.setCellTile([10, 8], tiles.find(t => t.letter = 'S'));
    board.setCellTile([10, 9], tiles.find(t => t.letter = 'O')
    );

    expect(board.isValidPlacement()).toEqual([false, 'New tiles must be connected to an existing tile.']);
  });

  test('move is rejected if tiles are not placed to form a single word', () => {
    board.setCellTile(
      [7, 7], 
      {
        ...tiles.find(t => t.letter = 'O'),
        playedTurn: 0,
        className: 'tile--played'
      }
    );
    board.setCellTile(
      [7, 8], 
      {
        ...tiles.find(t => t.letter = 'F'),
        playedTurn: 0,
        className: 'tile--played',
        totalPoints: 10
      }
    );
    board.setCellTile([8, 8], tiles.find(t => t.letter = 'A'));
    board.setCellTile([9, 8], tiles.find(t => t.letter = 'R'));
    board.setCellTile([11, 8], tiles.find(t => t.letter = 'T'));
    board.setCellTile([12, 8], tiles.find(t => t.letter = 'O'));

    expect(board.isValidPlacement()).toEqual([false, 'Pieces must be placed to form a single word.']);
  });

  test('first move is accepted if covering center square', () => {
    board.setCellTile([7, 7], tiles.find(t => t.letter = 'T'));
    board.setCellTile([7, 8], tiles.find(t => t.letter = 'O'));

    expect(board.isValidPlacement()).toEqual([true]);
  });

  test('move is accepted if tiles are connected to existing ones', () => {
    board.setCellTile(
      [7, 7], 
      {
        ...tiles.find(t => t.letter = 'H'),
        playedTurn: 0,
        className: 'tile--played'
      }
    );
    board.setCellTile(
      [7, 8], 
      {
        ...tiles.find(t => t.letter = 'I'),
        playedTurn: 0,
        className: 'tile--played',
        totalPoints: 10
      }
    );
    board.setCellTile([8, 7], tiles.find(t => t.letter = 'E'));
    board.setCellTile([9, 7], tiles.find(t => t.letter = 'L'));
    board.setCellTile([10, 7], tiles.find(t => t.letter = 'P'));

    expect(board.isValidPlacement()).toEqual([true]);
  });
});
