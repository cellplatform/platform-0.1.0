import { expect } from 'chai';

import { t } from '../../common';
import { CellRange } from '.';

const fromKey = CellRange.fromKey;

describe('CellRange', () => {
  describe('static', () => {
    it('isRangeKey', () => {
      expect(CellRange.isRangeKey('F39:F41')).to.eql(true);
      expect(CellRange.isRangeKey('F:F')).to.eql(true);
      expect(CellRange.isRangeKey('A1')).to.eql(false);
      expect(CellRange.isRangeKey('1')).to.eql(false);
      expect(CellRange.isRangeKey('A')).to.eql(false);
    });

    it('fromCells', () => {
      type Input = string | { key: string };
      const test = (left: Input, right: Input, output: string) => {
        const res = CellRange.fromCells(left, right);
        expect(res.key).to.eql(output);
      };
      test({ key: 'A1' }, { key: 'B2' }, 'A1:B2');
      test('A1', 'B2', 'A1:B2');
    });

    it('square', () => {
      const test = (keys: Array<string | { key: string }>, output: string) => {
        const res = CellRange.square(keys);
        expect(res.key).to.eql(output);
      };
      test(['A1'], 'A1:A1');
      test([{ key: 'A1' }], 'A1:A1');
      test(['Z9', 'A1'], 'A1:Z9');
    });
  });

  describe('range types', () => {
    it('A1:A4 (CELL)', () => {
      const range = fromKey('A1:A$4');
      expect(range.isValid).to.eql(true);
      expect(range.type).to.eql('CELL');
      expect(range.key).to.eql('A1:A4');
      expect(range.left.key).to.eql('A1');
      expect(range.right.key).to.eql('A4');
    });

    it('=A1:A4 (strips "=" sign)', () => {
      const range = fromKey(' =A1:A4 ');
      expect(range.isValid).to.eql(true);
      expect(range.type).to.eql('CELL');
      expect(range.key).to.eql('A1:A4');
    });

    it('A3:A (PARTIAL_COLUMN, A3..infinity)', () => {
      const range = fromKey('A3:A');
      expect(range.isValid).to.eql(true);
      expect(range.type).to.eql('PARTIAL_COLUMN');
      expect(range.left.key).to.eql('A3');
      expect(range.right.key).to.eql('A');
    });

    it('A:A3 (PARTIAL_COLUMN, same as A3:A)', () => {
      const range = fromKey('A:A3');
      expect(range.isValid).to.eql(true);
      expect(range.type).to.eql('PARTIAL_COLUMN');
      expect(range.left.key).to.eql('A');
      expect(range.right.key).to.eql('A3');
    });

    it('A3:3 (PARTIAL_ROW, A3..infinity)', () => {
      const range = fromKey('A3:3');
      expect(range.isValid).to.eql(true);
      expect(range.type).to.eql('PARTIAL_ROW');
      expect(range.left.key).to.eql('A3');
      expect(range.right.key).to.eql('3');
    });

    it('3:A3 (PARTIAL_ROW, same as A3:3)', () => {
      const range = fromKey('3:A3');
      expect(range.isValid).to.eql(true);
      expect(range.type).to.eql('PARTIAL_ROW');
      expect(range.left.key).to.eql('3');
      expect(range.right.key).to.eql('A3');
    });

    it('B:D (COLUMN)', () => {
      const range = fromKey('$B:D');
      expect(range.isValid).to.eql(true);
      expect(range.type).to.eql('COLUMN');
      expect(range.key).to.eql('B:D');
      expect(range.left.key).to.eql('B');
      expect(range.right.key).to.eql('D');
    });

    it('1:4 (ROW)', () => {
      const range = fromKey('$1:$4');
      expect(range.isValid).to.eql(true);
      expect(range.type).to.eql('ROW');
      expect(range.key).to.eql('1:4');
      expect(range.left.key).to.eql('1');
      expect(range.right.key).to.eql('4');
    });

    it('*:* (ALL)', () => {
      const range = fromKey('*:*');
      expect(range.isValid).to.eql(true);
      expect(range.type).to.eql('ALL');
      expect(range.key).to.eql('*:*');
      expect(range.left.column).to.eql(-1);
      expect(range.left.row).to.eql(-1);
      expect(range.right.column).to.eql(-1);
      expect(range.right.row).to.eql(-1);
    });

    it('Sheet1!*:* (ALL)', () => {
      const range = fromKey('Sheet1!*:*');
      expect(range.isValid).to.eql(true);
      expect(range.type).to.eql('ALL');
      expect(range.key).to.eql('*:*');
    });

    it('H2:* (PARTIAL_ALL)', () => {
      const range = fromKey('H2:*');
      expect(range.isValid).to.eql(true);
      expect(range.type).to.eql('PARTIAL_ALL');
      expect(range.key).to.eql('H2:*');
      expect(range.left.column).to.eql(7);
      expect(range.left.row).to.eql(1);
      expect(range.right.column).to.eql(-1);
      expect(range.right.row).to.eql(-1);
    });

    it('PARTIAL_ALL variants (*:D5, *:D5, D5:*, D5:**)', () => {
      const isPartialAll = (key: string) => {
        const range = fromKey(key);
        expect(range.isValid).to.eql(true, `Should be valid "${key}".`);
        expect(range.type).to.eql('PARTIAL_ALL', `Should be type PARTIAL_ALL "${key}".`);
      };
      isPartialAll('*:D5');
      isPartialAll('**:D5');
      isPartialAll('D5:*');
      isPartialAll('D5:**');
    });
  });

  describe('is', () => {
    it('is.column', () => {
      const test = (key: string, total: number, result: boolean) => {
        const range = fromKey(key);
        const res = range.is.column(total);
        expect(res).to.eql(result);
      };

      test('A:A', 10, true);

      test('A1:*', 10, true);
      test('A1:**', 10, true);
      test('A1:A10', 10, true);
      test('A1:B10', 10, true);
      test('A1:A99', 10, true); // Overshoot.

      test('1:1', 10, false);
      test('A2:*', 10, false);
      test('A1:A9', 10, false);
      test('A2:A10', 10, false);
    });

    it('is.row', () => {
      const test = (key: string, total: number, result: boolean) => {
        const range = fromKey(key);
        const res = range.is.row(total);
        expect(res).to.eql(result);
      };

      test('1:1', 10, true);

      test('A1:*', 10, true);
      test('A1:**', 10, true);
      test('A1:J1', 10, true);
      test('A1:ZZ1', 10, true); // Overshoot.

      test('A:A', 10, false);
      test('A1:H1', 10, false);
      test('B1:J1', 10, false);
      test('B1:*', 10, false);
    });
  });

  describe('errors', () => {
    it('error: INVALID RANGE', () => {
      const range = fromKey('..');
      expect(range.isValid).to.eql(false);
      expect(range.error).to.contain('INVALID RANGE ".."');
    });

    it('error: range spans different sheets', () => {
      const range = fromKey('Sheet1!A1:Sheet2!B5');
      expect(range.isValid).to.eql(false);
      expect(range.error).to.contain(`Ranges can only exist on a single sheet.`);
    });
  });

  it('valid', () => {
    const valid = (key: string) => {
      const range = fromKey(key);
      expect(range.isValid).to.eql(true, `key '${key}' should be valid.`);
    };
    valid('A:A');
    valid('A:B');
    valid('1:1');
    valid('1:999');
    valid('A1:Z99');
    valid('A$1:B2');
    valid('$A$1:$B$2');
    valid('$A:B');
    valid('A:$B');
    valid('$1:3');
    valid('1:$3');

    valid('*:*');
    valid('Sheet1!*:*');
    valid('*:H3');
    valid('**:H3');
    valid('H3:*');
    valid('H3:**');

    valid('A1:B'); // Mixing CELL and COLUMN.
    valid('1:A1');
    valid('1:A');
    valid('A1:A');
    valid('A:A3');
    valid('3:A3');
    valid('Sheet1!A:B');
    valid('Sheet1!A:Sheet1!B');
    valid('A:Sheet1!B');
  });

  it('invalid', () => {
    const invalid = (key: string) => {
      const range = fromKey(key);
      expect(range.isValid).to.eql(false, `key '${key}' should be invalid.`);
    };
    invalid('');
    invalid(' ');
    invalid('..');
    invalid('A');
    invalid('1');
    invalid(' A  ');
    invalid('  1 ');
    invalid('A:B:C');
    invalid(':');
    invalid(' A1:');
    invalid(':C34 ');

    invalid('2:*'); // NB: May support later.
    invalid('*:2'); // NB: May support later.

    invalid('***:H3');
    invalid('H3:***');

    invalid('1:-1');
    invalid('-1:1');
    invalid('-1:-1');
  });

  describe('square (correct out of order ranges, eg: "C4:A1" => "A1:C4")', () => {
    it('CELL - C4:A1 => A1:C4', () => {
      const range = fromKey('C4:A1');
      const square = range.square;
      expect(square.key).to.eql('A1:C4');

      expect(range.left.key).to.eql('C4');
      expect(range.right.key).to.eql('A1');

      expect(square.left.key).to.eql('A1');
      expect(square.right.key).to.eql('C4');
    });

    it('CELL - B10:E9 => B9:E10', () => {
      const range = fromKey('B10:E9');
      const square = range.square;
      expect(square.key).to.eql('B9:E10');

      expect(range.left.key).to.eql('B10');
      expect(range.right.key).to.eql('E9');

      expect(square.left.key).to.eql('B9');
      expect(square.right.key).to.eql('E10');
    });

    it('COLUMN - C:A => A:C', () => {
      const range = fromKey('C:A');
      const square = range.square;
      expect(square.key).to.eql('A:C');
      expect(square.left.column).to.eql(0);
      expect(square.right.column).to.eql(2);
    });

    it('ROW - 3:1 => 1:3', () => {
      const range = fromKey('3:1');
      const square = range.square;
      expect(square.key).to.eql('1:3');
      expect(square.left.row).to.eql(0);
      expect(square.right.row).to.eql(2);
    });

    it('PARTIAL_COLUMN - A:A3 => A3:3', () => {
      const range = fromKey('A:A3');
      const square = range.square;
      expect(square).to.not.equal(range);
      expect(square.type).to.eql('PARTIAL_COLUMN');
      expect(square.left.key).to.eql('A3');
      expect(square.right.key).to.eql('A');
      expect(square.square).to.equal(square); // No change, aleady a square.
    });

    it('PARTIAL_ROW - 3:A3 => A3:3', () => {
      const range = fromKey('3:A3');
      const square = range.square;
      expect(square).to.not.equal(range);
      expect(square.type).to.eql('PARTIAL_ROW');
      expect(square.left.key).to.eql('A3');
      expect(square.right.key).to.eql('3');
      expect(square.square).to.equal(square); // No change, aleady a square.
    });

    it('ALL - *:*', () => {
      const range = fromKey(' *:* ');
      expect(range).to.equal(range.square);
    });

    it('PARTIAL_ALL - *:A3 | **:A3 | A3:* | A3:**', () => {
      const partialAll = (key: string) => {
        const range = fromKey(key);
        const square = range.square;
        expect(square).to.equal(range);
      };
      partialAll('*:A3');
      partialAll('**:A3');
      partialAll('A3:*');
      partialAll('A3:**');
    });

    it('PARTIAL_ALL - A3:**', () => {
      const range = fromKey('A3:**');
      const square = range.square;
      expect(square.type).to.eql('PARTIAL_ALL');
      expect(square.left.key).to.eql('A3');
      expect(square.right.key).to.eql('**');
      expect(square.square).to.eql(square);
    });

    it('PARTIAL_ALL - **:A3', () => {
      const range = fromKey('**:A3');
      const square = range.square;
      expect(square.type).to.eql('PARTIAL_ALL');
      expect(square.left.key).to.eql('**');
      expect(square.right.key).to.eql('A3');
      expect(square.square).to.eql(square);
    });

    it('no change (original range is already a square)', () => {
      const range = fromKey('B2:C5');
      expect(range.square).to.equal(range);
    });

    it('reuses the same square range on multiple calls', () => {
      const range = fromKey('B10:E9');
      const square1 = range.square;
      const square2 = range.square;
      expect(square1).to.not.equal(range);
      expect(square2).to.not.equal(range);
      expect(square1).to.equal(square2); // Reuse of instance.
    });
  });

  describe('contains', () => {
    it('CELL range contains (A2:C3)', () => {
      const range = fromKey('A2:C3'); // NB: Out of order (left/right), works both ways.
      expect(range.contains('A1')).to.eql(false);
      expect(range.contains('A2')).to.eql(true);
      expect(range.contains('A3')).to.eql(true);
      expect(range.contains('A4')).to.eql(false);

      expect(range.contains('B1')).to.eql(false);
      expect(range.contains('B2')).to.eql(true);
      expect(range.contains('B3')).to.eql(true);
      expect(range.contains('B4')).to.eql(false);

      expect(range.contains('C1')).to.eql(false);
      expect(range.contains('C2')).to.eql(true);
      expect(range.contains('C3')).to.eql(true);
      expect(range.contains('C4')).to.eql(false);
    });

    it('COLUMN range contains (single - B:B)', () => {
      const range = fromKey('B:B');
      expect(range.contains('A1')).to.eql(false);
      expect(range.contains('B1')).to.eql(true);
      expect(range.contains('B2')).to.eql(true);
      expect(range.contains('B999999')).to.eql(true);
      expect(range.contains('C1')).to.eql(false);
    });

    it('COLUMN range contains (multi - B:C)', () => {
      const range = fromKey('B:C');
      expect(range.contains('A1')).to.eql(false);
      expect(range.contains('B1')).to.eql(true);
      expect(range.contains('C1')).to.eql(true);
      expect(range.contains('D1')).to.eql(false);
    });

    it('ROW range contains (single - 3:3)', () => {
      const range = fromKey('3:3');
      expect(range.contains('B2')).to.eql(false);
      expect(range.contains('B3')).to.eql(true);
      expect(range.contains('B4')).to.eql(false);

      expect(range.contains('A3')).to.eql(true);
      expect(range.contains('B3')).to.eql(true);
      expect(range.contains('C3')).to.eql(true);
      expect(range.contains('ZZZZZ3')).to.eql(true);
    });

    it('ROW range contains (multi - 3:4)', () => {
      const range = fromKey('3:4');
      expect(range.contains('A2')).to.eql(false);
      expect(range.contains('A3')).to.eql(true);
      expect(range.contains('A4')).to.eql(true);
      expect(range.contains('A5')).to.eql(false);
    });

    it('PARTIAL_COLUMN contains (single - A3:A)', () => {
      const range = fromKey('A3:A');
      expect(range.contains('A1')).to.eql(false);
      expect(range.contains('A2')).to.eql(false);
      expect(range.contains('A3')).to.eql(true);
      expect(range.contains('A9999')).to.eql(true);

      expect(range.contains('B1')).to.eql(false);
      expect(range.contains('B3')).to.eql(false);
      expect(range.contains('B99')).to.eql(false);
    });

    it('PARTIAL_COLUMN contains (multi - A3:B)', () => {
      const range = fromKey('A3:B');
      expect(range.contains('A2')).to.eql(false);
      expect(range.contains('A3')).to.eql(true);
      expect(range.contains('A9999')).to.eql(true);

      expect(range.contains('B2')).to.eql(false);
      expect(range.contains('B3')).to.eql(true);
      expect(range.contains('B9999')).to.eql(true);

      expect(range.contains('C2')).to.eql(false);
      expect(range.contains('C3')).to.eql(false);
      expect(range.contains('C9999')).to.eql(false);

      expect(range.contains('B')).to.eql(false);
      expect(range.contains('3')).to.eql(false);
    });

    it('PARTIAL_ROW contains (single - A3:3)', () => {
      const range = fromKey('A3:3');
      expect(range.contains('A1')).to.eql(false);
      expect(range.contains('A3')).to.eql(true);
      expect(range.contains('ZZZ3')).to.eql(true);

      expect(range.contains('A4')).to.eql(false);

      expect(range.contains('A')).to.eql(false);
      expect(range.contains('5')).to.eql(false);
    });

    it('PARTIAL_ROW contains (multi)', () => {
      const range = fromKey('A3:4');
      expect(range.contains('A1')).to.eql(false);
      expect(range.contains('A3')).to.eql(true);
      expect(range.contains('ZZZ3')).to.eql(true);

      expect(range.contains('A4')).to.eql(true);
      expect(range.contains('ZZZ4')).to.eql(true);

      expect(range.contains('A5')).to.eql(false);
    });

    it('ALL (*:*)', () => {
      const range = fromKey('*:*');
      expect(range.contains('A1')).to.eql(true);
      expect(range.contains('1')).to.eql(true);
      expect(range.contains('A')).to.eql(true);
      expect(range.contains('*')).to.eql(true);
    });

    it('PARTIAL_ALL (B3:*) - cell to top/right', () => {
      const range = fromKey('B3:*');
      expect(range.contains('A1')).to.eql(false);
      expect(range.contains('A2')).to.eql(false);
      expect(range.contains('A3')).to.eql(false);
      expect(range.contains('A4')).to.eql(false);

      expect(range.contains('B1')).to.eql(true);
      expect(range.contains('B2')).to.eql(true);
      expect(range.contains('B3')).to.eql(true);
      expect(range.contains('B4')).to.eql(false);

      expect(range.contains('ZZ1')).to.eql(true);
      expect(range.contains('ZZ2')).to.eql(true);
      expect(range.contains('ZZ3')).to.eql(true);
      expect(range.contains('ZZ4')).to.eql(false);
    });

    it('PARTIAL_ALL (B3:**) - cell to bottom/right', () => {
      const range = fromKey('B3:**');
      expect(range.contains('A1')).to.eql(false);
      expect(range.contains('A2')).to.eql(false);
      expect(range.contains('A3')).to.eql(false);
      expect(range.contains('A4')).to.eql(false);

      expect(range.contains('B1')).to.eql(false);
      expect(range.contains('B2')).to.eql(false);
      expect(range.contains('B3')).to.eql(true);
      expect(range.contains('B4')).to.eql(true);
      expect(range.contains('B999')).to.eql(true);

      expect(range.contains('XX1')).to.eql(false);
      expect(range.contains('XX2')).to.eql(false);
      expect(range.contains('XX3')).to.eql(true);
      expect(range.contains('XX4')).to.eql(true);
      expect(range.contains('XX999')).to.eql(true);
    });

    it('PARTIAL_ALL (*:B3) - top/left to cell', () => {
      const range = fromKey('*:B3');
      expect(range.contains('A1')).to.eql(true);
      expect(range.contains('A2')).to.eql(true);
      expect(range.contains('A3')).to.eql(true);
      expect(range.contains('A4')).to.eql(false);

      expect(range.contains('B1')).to.eql(true);
      expect(range.contains('B2')).to.eql(true);
      expect(range.contains('B3')).to.eql(true);
      expect(range.contains('B4')).to.eql(false);

      expect(range.contains('C1')).to.eql(false);
      expect(range.contains('C2')).to.eql(false);
      expect(range.contains('C3')).to.eql(false);
      expect(range.contains('C4')).to.eql(false);
    });

    it('PARTIAL_ALL (**:B3) - bottom/left to cell', () => {
      const range = fromKey('**:B3');
      expect(range.contains('A1')).to.eql(false);
      expect(range.contains('A2')).to.eql(false);
      expect(range.contains('A3')).to.eql(true);
      expect(range.contains('A999')).to.eql(true);

      expect(range.contains('B1')).to.eql(false);
      expect(range.contains('B2')).to.eql(false);
      expect(range.contains('B3')).to.eql(true);
      expect(range.contains('B999')).to.eql(true);

      expect(range.contains('C1')).to.eql(false);
      expect(range.contains('C2')).to.eql(false);
      expect(range.contains('C3')).to.eql(false);
      expect(range.contains('C999')).to.eql(false);
    });

    it('contains COLUMN', () => {
      expect(fromKey('A1:B5').contains('A')).to.eql(false);
      expect(fromKey('A:C').contains('1')).to.eql(false);

      expect(fromKey('B:C').contains('A')).to.eql(false);
      expect(fromKey('B:C').contains('B')).to.eql(true);
      expect(fromKey('B:C').contains('C')).to.eql(true);
      expect(fromKey('B:C').contains('D')).to.eql(false);
    });

    it('contains ROW', () => {
      expect(fromKey('A1:B5').contains('1')).to.eql(false);
      expect(fromKey('2:2').contains('1')).to.eql(false);

      expect(fromKey('2:5').contains('1')).to.eql(false);
      expect(fromKey('2:5').contains('2')).to.eql(true);
      expect(fromKey('2:5').contains('3')).to.eql(true);
      expect(fromKey('2:5').contains('4')).to.eql(true);
      expect(fromKey('2:5').contains('5')).to.eql(true);
      expect(fromKey('2:5').contains('6')).to.eql(false);
    });

    it('contains (from row/column indexes overload)', () => {
      expect(fromKey('A1:B2').contains(0, 0)).to.eql(true);
      expect(fromKey('A1:B2').contains(5, 0)).to.eql(false);
    });
  });

  describe('keys', () => {
    it('caches result', () => {
      const range = fromKey('A1:A3');
      const keys1 = range.keys;
      const keys2 = range.keys;
      expect(keys1).to.equal(keys2);
    });

    describe('infinity ranges returns empty array', () => {
      it('COLUMN (A:A)', () => {
        expect(fromKey('A:A').keys).to.eql([]);
      });

      it('ROW (3:3)', () => {
        expect(fromKey('3:3').keys).to.eql([]);
      });

      it('PARTIAL_COLUMN (A3:A)', () => {
        expect(fromKey('A3:A').keys).to.eql([]);
        expect(fromKey('A:A3').keys).to.eql([]);
      });

      it('PARTIAL_ROW (A3:3)', () => {
        expect(fromKey('A3:3').keys).to.eql([]);
        expect(fromKey('3:A3').keys).to.eql([]);
      });

      it('ALL (*:*)', () => {
        expect(fromKey('*:*').keys).to.eql([]);
      });

      it('PARTIAL_ALL', () => {
        expect(fromKey('A3:*').keys).to.eql([]);
        expect(fromKey('A3:**').keys).to.eql([]);
        expect(fromKey('*:A3').keys).to.eql([]);
        expect(fromKey('**:A3').keys).to.eql([]);
      });
    });

    describe('sorting', () => {
      const SORTED = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
      it('A1:C3 (lowest to highest)', () => {
        const range = fromKey('A1:C3');
        expect(range.keys).to.eql(SORTED);
      });

      it('A1:C3 (out of order)', () => {
        const range = fromKey('C3:A1');
        expect(range.keys).to.eql(SORTED);
      });
    });

    it('CELL - B2:D4', () => {
      const range = fromKey('B2:D4');
      const cells = range.keys;
      expect(cells.length).to.eql(9);
      expect(cells[0]).to.eql('B2');
      expect(cells[1]).to.eql('B3');
      expect(cells[2]).to.eql('B4');
      expect(cells[3]).to.eql('C2');
      expect(cells[4]).to.eql('C3');
      expect(cells[5]).to.eql('C4');
      expect(cells[6]).to.eql('D2');
      expect(cells[7]).to.eql('D3');
      expect(cells[8]).to.eql('D4');
    });

    it('CELL - D4:B2 (inverted to square => )', () => {
      const range = fromKey('D4:B2'); // NB: inverted range, `square` used to calculate.
      expect(range.keys).to.eql(range.square.keys);
    });

    it('CELL - A1:A1 (single)', () => {
      const range = fromKey('A1:A1');
      expect(range.keys).to.eql(['A1']);
    });
  });

  describe('toString', () => {
    it('string', () => {
      expect(fromKey('A1:B5').toString()).to.eql('[RANGE/A1:B5]');
      expect(fromKey('A:B').toString()).to.eql('[RANGE/A:B]');
      expect(fromKey('2:2').toString()).to.eql('[RANGE/2:2]');
      expect(fromKey('2:A2').toString()).to.eql('[RANGE/2:A2]');
      expect(fromKey('A2:2').toString()).to.eql('[RANGE/A2:2]');
      expect(fromKey('A:A2').toString()).to.eql('[RANGE/A:A2]');
      expect(fromKey('A2:A').toString()).to.eql('[RANGE/A2:A]');
      expect(fromKey('A3:*').toString()).to.eql('[RANGE/A3:*]');
      expect(fromKey('A3:**').toString()).to.eql('[RANGE/A3:**]');
      expect(fromKey('*:A3').toString()).to.eql('[RANGE/*:A3]');
      expect(fromKey('**:A3').toString()).to.eql('[RANGE/**:A3]');
    });

    it('error', () => {
      expect(fromKey('2:*').toString()).to.contain('INVALID RANGE "2:*"');
    });
  });

  describe('adjustSize', () => {
    it('TOP (-2)', () => {
      const range = fromKey('B3:B4').adjustSize('TOP', -2);
      expect(range.key).to.eql('B1:B4');
    });

    it('RIGHT (+1)', () => {
      const range = fromKey('B3:B4').adjustSize('RIGHT', 1);
      expect(range.key).to.eql('B3:C4');
    });

    it('RIGHT (-1)', () => {
      const range = fromKey('B3:B3').adjustSize('RIGHT', -1);
      expect(range.key).to.eql('B3:A3');
      expect(range.square.key).to.eql('A3:B3');
    });

    it('BOTTOM (+1)', () => {
      const range = fromKey('B3:B4').adjustSize('BOTTOM', 1);
      expect(range.key).to.eql('B3:B5');
    });

    it('LEFT (-1)', () => {
      const range = fromKey('B3:B4').adjustSize('LEFT', -1);
      expect(range.key).to.eql('A3:B4');
    });

    it('does not reduce less than 0,0', () => {
      const left = fromKey('C3:C4').adjustSize('LEFT', -50);
      const top = fromKey('C3:C4').adjustSize('TOP', -50);
      const right = fromKey('B3:B3').adjustSize('RIGHT', -50);
      expect(left.key).to.eql('A3:C4');
      expect(top.key).to.eql('C1:C4');
      expect(right.key).to.eql('B3:A3');
    });

    it('does not expand greater that total columns/rows', () => {
      const bottom = fromKey('C3:C4').adjustSize('BOTTOM', 999, {
        totalRows: 10,
      });
      const right = fromKey('C3:C4').adjustSize('RIGHT', 999, {
        totalColumns: 10,
      });
      expect(bottom.key).to.eql('C3:C10');
      expect(right.key).to.eql('C3:J4');
    });
  });

  describe('edge', () => {
    it('is an edge', () => {
      const isEdge = (cellKey: string, rangeKey: string, edges: t.CoordEdge[]) => {
        const range = fromKey(rangeKey);
        const res = range.edge(cellKey);
        expect(res).to.eql(edges, `Cell "${cellKey}", range "${range.key}".`);
      };

      isEdge('B2', 'B2:D4', ['TOP', 'LEFT']);
      isEdge('B3', 'B2:D4', ['LEFT']);
      isEdge('B4', 'B2:D4', ['BOTTOM', 'LEFT']);

      isEdge('C2', 'B2:D4', ['TOP']);
      isEdge('C4', 'B2:D4', ['BOTTOM']);

      isEdge('D2', 'B2:D4', ['TOP', 'RIGHT']);
      isEdge('D3', 'B2:D4', ['RIGHT']);
      isEdge('D4', 'B2:D4', ['RIGHT', 'BOTTOM']);
    });

    it('not an edge', () => {
      const notEdge = (cellKey: string, rangeKey: string) => {
        const range = fromKey(rangeKey);
        const res = range.edge(cellKey);
        expect(res).to.eql([], `Cell "${cellKey}", range "${range.key}".`);
      };
      notEdge('A1', 'B2:C3'); // Cell outside of range.
      notEdge('C3', 'B2:D5'); // Cell in the middle of range.
      notEdge('B2', 'C3:B2'); // Not a square (inverted left > right).
    });
  });

  describe('formatted', () => {
    it('no change', () => {
      const range = fromKey('A2:A10');
      const res = range.formated({ totalColumns: 10, totalRows: 10 });
      expect(res).to.equal(range); // Same instance.
    });

    it('adusts column', () => {
      const test = (input: string, output: string) => {
        const range = fromKey(input);
        const res = range.formated({ totalColumns: 10, totalRows: 10 });
        expect(res).to.not.equal(range); // Different instance.
        expect(res.key).to.eql(output);
      };
      test('A1:A10', 'A:A');
      test('A1:B10', 'A:B');
      test('A1:F10', 'A:F');
    });

    it('adusts row', () => {
      const test = (input: string, output: string) => {
        const range = fromKey(input);
        const res = range.formated({ totalColumns: 10, totalRows: 10 });
        expect(res).to.not.equal(range); // Different instance.
        expect(res.key).to.eql(output);
      };
      test('A1:J1', '1:1');
      test('A1:J2', '1:2');
      test('A1:J9', '1:9');
    });
  });

  describe('toSize', () => {
    it('calculate size', () => {
      const test = (input: string, width: number, height: number) => {
        const range = fromKey(input);
        const size = range.toSize({ totalColumns: 10, totalRows: 10 });
        expect(size.width).to.eql(width);
        expect(size.height).to.eql(height);
      };

      test('A1:A10', 1, 10);
      test('A1:B10', 2, 10);
      test('A1:B5', 2, 5);
      test('B2:C4', 2, 3);
      test('C5:J10', 8, 6);

      // Clip to max table size.
      test('A1:A50', 1, 10);
      test('A1:ZZ1', 10, 1);
      test('C5:ZZ99', 8, 6); // Clipped

      // Full row/column.
      test('A:A', 1, 10);
      test('A:B', 2, 10);
      test('A:E', 5, 10);
      test('A:ZZ', 10, 10); // Clipped.

      test('1:1', 10, 1);
      test('1:2', 10, 2);
      test('1:5', 10, 5);
      test('1:99', 10, 10); // Clipped.
    });
  });
});
