import { expect } from 'chai';
import { Cell } from '.';

describe('Cell', () => {
  describe('static', () => {
    it('converts row/column to key', () => {
      expect(Cell.toKey({ row: 0, column: 0 })).to.eql('A1');
      expect(Cell.toKey({ row: 4, column: 1 })).to.eql('B5');
    });
  });
});
