import { expect } from 'chai';
import { CellRangeUnion } from '.';
import { t } from '../../common';

const fromKey = CellRangeUnion.fromKey;

describe('CellRangeUnion', () => {
  describe('fromKeys (array)', () => {
    it('has no regions', () => {
      expect(fromKey([]).length).to.eql(0);
      expect(fromKey([]).ranges).to.eql([]);
      expect(fromKey(['']).ranges).to.eql([]);
      expect(fromKey([' ']).ranges).to.eql([]);
      expect(fromKey([' ', '']).ranges).to.eql([]);
    });
    it('has one region (single string param)', () => {
      const union = fromKey(['A1:A5']);
      expect(union.length).to.eql(1);
      expect(union.ranges[0].key).to.eql('A1:A5');
    });
    it('has one region (array)', () => {
      const union = fromKey(['A1:A5']);
      expect(union.length).to.eql(1);
      expect(union.ranges[0].key).to.eql('A1:A5');
    });
    it('has several regions', () => {
      const union = fromKey(['A1:A5', 'B:B', '5:5']);
      expect(union.length).to.eql(3);
      expect(union.ranges[0].key).to.eql('A1:A5');
      expect(union.ranges[1].key).to.eql('B:B');
      expect(union.ranges[2].key).to.eql('5:5');
    });
  });

  describe('fromKey (string, comma-seperated)', () => {
    it('has no regions', () => {
      const empty = (key: string) => {
        expect(fromKey(key).length).to.eql(0);
        expect(fromKey(key).ranges).to.eql([]);
      };
      empty('');
      empty('  ');
    });
    it('has one region', () => {
      const empty = (key: string) => {
        expect(fromKey(key).length).to.eql(1);
        expect(fromKey(key).ranges[0].key).to.eql(key.trim());
      };
      empty('A1:C5');
      empty('  A1:C5    ');
    });
    it('has several regions', () => {
      const union = fromKey('  A1:A5, B:B,   5:5, ');
      expect(union.length).to.eql(3);
      expect(union.key).to.eql('A1:A5, B:B, 5:5');
      expect(union.ranges[0].key).to.eql('A1:A5');
      expect(union.ranges[1].key).to.eql('B:B');
      expect(union.ranges[2].key).to.eql('5:5');
    });
    it('inverts each range to a square', () => {
      const test = (input: string, output: string) => {
        const res = fromKey(input);
        expect(res.key).to.eql(output);
      };
      test('A1:B2', 'A1:B2');
      test('B2:A1', 'A1:B2');
      test('B2:A1,ZZ99:C1', 'A1:B2, C1:ZZ99');
    });
  });

  it('constructs consistent key from all unions', () => {
    const hasKey = (input: string, expected: string) => {
      const union = fromKey(input);
      expect(union.key).to.eql(expected, `range input "${input}"`);
    };
    hasKey('A1:A2', 'A1:A2');
    hasKey('  A1:A5, B:B,   5:5 ', 'A1:A5, B:B, 5:5');
    hasKey('A1:A2, A1:A2, A1:A3', 'A1:A2, A1:A3');
  });
  it('unique ranges (ommits duplicate ranges)', () => {
    const union = fromKey('A1:A2, B3:B4, A1:A2, B3:B4,B3:B4,B3:B4,');
    expect(union.length).to.eql(2);
    expect(union.key).to.eql('A1:A2, B3:B4');
  });

  describe('contains', () => {
    const tester = (result: boolean) => {
      return (cell: t.ICoordPosition | string, rangeKeys: string[]) => {
        const union = fromKey(rangeKeys);
        expect(union.contains(cell)).to.eql(result, `cell "${cell}", rangeKeys: ${rangeKeys} `);
      };
    };
    it('does contain', () => {
      const contains = tester(true);
      contains('A1', ['A1:A5']);
      contains('A5', ['A1:A5']);
      contains('B3', ['A1:A5', 'A1:C8']);
      contains('A1', ['*:*']);
      contains('A1', ['A:A']);
      contains('A5', ['A4:**']);
      contains('B5', ['A:A', '3:6']);
    });
    it('does not contain', () => {
      const notContain = tester(false);
      notContain('A1', []);
      notContain('A6', ['A1:A5']);
      notContain('G3', ['A1:A5', 'A1:C8']);
      notContain('A5', ['A4:*']);
      notContain('G3', ['F:F', 'H:H', '1:2']);
    });
  });

  describe('keys', () => {
    it('caches response', () => {
      const union = fromKey('A1:B3, B1:B3');
      const keys1 = union.keys;
      const keys2 = union.keys;
      expect(keys1).to.equal(keys2);
    });
    it('is empty (for non-CELL range types)', () => {
      const union = fromKey('A:A, 3:3, A3:A, A3:3, *:*, A3:*, A3:**, *:A3, *:A3');
      expect(union.keys).to.eql([]);
    });
    it('combines several ranges (unique keys)', () => {
      const union = fromKey('A1:B3, B2:C4');
      const keys = union.keys;
      expect(keys).to.eql(['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'B4', 'C2', 'C3', 'C4']);
    });
    it('sorts (lowest to highest)', () => {
      const union1 = fromKey('A1:B3,    B2:C4');
      const union2 = fromKey('C4:B2,B3:A1');
      const keys = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'B4', 'C2', 'C3', 'C4'];
      expect(union1.keys).to.eql(keys);
      expect(union2.keys).to.eql(keys);
    });
  });

  describe('square', () => {
    it('undefined (empty, no ranges)', () => {
      const union = fromKey('');
      expect(union.keys).to.eql([]);
      expect(union.square).to.eql(undefined);
    });

    it('square', () => {
      const test = (input: string, output: string) => {
        const union = fromKey(input);
        const square = union.square;
        expect(square && square.key).to.eql(output);
      };
      test('A1:A1', 'A1:A1');
      test('C4:B2,B3:A1', 'A1:C4');
      test('C:C', 'C:C');
      test('C:C,A:A', 'A:C');
      test('1:1', '1:1');
      test('5:5, 1:1', '1:5');
    });
  });

  describe('edge', () => {
    const edge = (cellKey: string, rangeKey: string, edges: t.CoordEdge[]) => {
      const union = fromKey(rangeKey);
      const res = union.edge(cellKey);
      expect(res).to.eql(edges, `Cell "${cellKey}", range "${rangeKey}".`);
    };
    it('overlapping middle - B2:C4, C3:D5', () => {
      const RANGE = 'B2:C4, C3:D5';
      edge('B1', RANGE, []);
      edge('B2', RANGE, ['TOP', 'LEFT']);
      edge('B3', RANGE, ['LEFT']);
      edge('B4', RANGE, ['BOTTOM', 'LEFT']);
      edge('B5', RANGE, []);
      edge('C1', RANGE, []);
      edge('C2', RANGE, ['TOP', 'RIGHT']);
      edge('C3', RANGE, []); // Overlaps - middle.
      edge('C4', RANGE, []); // Overlaps - middle.
      edge('C5', RANGE, ['BOTTOM', 'LEFT']);
      edge('C6', RANGE, []);
      edge('D2', RANGE, []);
      edge('D3', RANGE, ['TOP', 'RIGHT']);
      edge('D4', RANGE, ['RIGHT']);
      edge('D5', RANGE, ['RIGHT', 'BOTTOM']);
      edge('D6', RANGE, []);
    });
    it('overlapping left - A1:A3, A3:B4', () => {
      const RANGE = 'A1:A3, A3:B4';
      edge('A1', RANGE, ['TOP', 'RIGHT', 'LEFT']);
      edge('A2', RANGE, ['RIGHT', 'LEFT']);
      edge('A3', RANGE, ['LEFT']);
      edge('A4', RANGE, ['BOTTOM', 'LEFT']);
      edge('A5', RANGE, []);
      edge('B1', RANGE, []);
      edge('B2', RANGE, []);
      edge('B3', RANGE, ['TOP', 'RIGHT']);
      edge('B4', RANGE, ['RIGHT', 'BOTTOM']);
      edge('B5', RANGE, []);
      edge('C1', RANGE, []);
      edge('C99', RANGE, []);
    });
    it('contiguous left/right - A1:A3, B1:B5', () => {
      const RANGE = 'A1:A3, B1:B5';
      edge('A1', RANGE, ['TOP', 'LEFT']);
      edge('A2', RANGE, ['LEFT']);
      edge('A3', RANGE, ['BOTTOM', 'LEFT']);
      edge('A4', RANGE, []);
      edge('B1', RANGE, ['TOP', 'RIGHT']);
      edge('B2', RANGE, ['RIGHT']);
      edge('B3', RANGE, ['RIGHT']);
      edge('B4', RANGE, ['RIGHT', 'LEFT']);
      edge('B5', RANGE, ['RIGHT', 'BOTTOM', 'LEFT']);
      edge('B6', RANGE, []);
    });
    it('contiguous top/bottom - A1:B2, A3:B5', () => {
      const RANGE = 'A1:B2, A3:B5';
      edge('A1', RANGE, ['TOP', 'LEFT']);
      edge('A2', RANGE, ['LEFT']);
      edge('A3', RANGE, ['LEFT']);
      edge('A4', RANGE, ['LEFT']);
      edge('A5', RANGE, ['BOTTOM', 'LEFT']);
      edge('A6', RANGE, []);
      edge('B1', RANGE, ['TOP', 'RIGHT']);
      edge('B2', RANGE, ['RIGHT']);
      edge('B3', RANGE, ['RIGHT']);
      edge('B4', RANGE, ['RIGHT']);
      edge('B5', RANGE, ['RIGHT', 'BOTTOM']);
      edge('B6', RANGE, []);
    });
    it('non overlapping islands - A1:A2, C2:C3', () => {
      const RANGE = 'A1:A3, C2:C4';
      edge('A1', RANGE, ['TOP', 'RIGHT', 'LEFT']);
      edge('A2', RANGE, ['RIGHT', 'LEFT']);
      edge('A3', RANGE, ['RIGHT', 'BOTTOM', 'LEFT']);
      edge('A4', RANGE, []);
      edge('B1', RANGE, []);
      edge('B2', RANGE, []);
      edge('B3', RANGE, []);
      edge('B4', RANGE, []);
      edge('C1', RANGE, []);
      edge('C2', RANGE, ['TOP', 'RIGHT', 'LEFT']);
      edge('C3', RANGE, ['RIGHT', 'LEFT']);
      edge('C4', RANGE, ['RIGHT', 'BOTTOM', 'LEFT']);
    });
    it('3 ranges', () => {
      const RANGE = 'A1:B2, B2:C4, B3:B5';
      edge('A1', RANGE, ['TOP', 'LEFT']);
      edge('A2', RANGE, ['BOTTOM', 'LEFT']);
      edge('A3', RANGE, []);
      edge('B1', RANGE, ['TOP', 'RIGHT']);
      edge('B2', RANGE, []);
      edge('B3', RANGE, ['LEFT']);
      edge('B4', RANGE, ['LEFT']);
      edge('B5', RANGE, ['RIGHT', 'BOTTOM', 'LEFT']);
      edge('C1', RANGE, []);
      edge('C2', RANGE, ['TOP', 'RIGHT']);
      edge('C3', RANGE, ['RIGHT']);
      edge('C4', RANGE, ['RIGHT', 'BOTTOM']);
      edge('C5', RANGE, []);
    });
    it('overlapping contiguous (1)', () => {
      const RANGE = 'B1:B3, B2:C4';
      edge('B1', RANGE, ['TOP', 'RIGHT', 'LEFT']);
      edge('B2', RANGE, ['LEFT']);
      edge('B3', RANGE, ['LEFT']);
      edge('B4', RANGE, ['BOTTOM', 'LEFT']);
      edge('B5', RANGE, []);
      edge('C1', RANGE, []);
      edge('C2', RANGE, ['TOP', 'RIGHT']);
      edge('C3', RANGE, ['RIGHT']);
      edge('C4', RANGE, ['RIGHT', 'BOTTOM']);
      edge('C5', RANGE, []);
    });
    it('overlapping contiguous (2)', () => {
      const RANGE = 'B1:B3, B2:C4';
      edge('B1', RANGE, ['TOP', 'RIGHT', 'LEFT']);
      edge('B2', RANGE, ['LEFT']);
      edge('B3', RANGE, ['LEFT']);
      edge('B4', RANGE, ['BOTTOM', 'LEFT']);
      edge('B5', RANGE, []);
      edge('C1', RANGE, []);
      edge('C2', RANGE, ['TOP', 'RIGHT']);
      edge('C3', RANGE, ['RIGHT']);
      edge('C4', RANGE, ['RIGHT', 'BOTTOM']);
      edge('C5', RANGE, []);
    });
  });

  describe('filter', () => {
    it('filters on columns', () => {
      const union = fromKey('  A1:A10, B3:B10, C:C ');
      const res = union.filter(range => range.is.column(10));

      expect(res).to.not.equal(union); // NB: Different instance.
      expect(res.length).to.eql(2);

      const square = res.square;
      expect(square && square.left.key).to.eql('A1');
      expect(square && square.right.key).to.eql('C');
    });

    it('no change', () => {
      const union = fromKey('  A1:A10, B3:B10, C:C ');
      const res = union.filter(range => true);
      expect(res).to.not.equal(union); // NB: Different instance.
      expect(res.toString()).to.eql(res.toString());
    });
  });

  describe('formatted', () => {
    it('no change', () => {
      const input = 'A2:A10, B4:J4';
      const union = fromKey(input);
      const res = union.formated({ totalColumns: 10, totalRows: 10 });
      const keys = res.ranges.map(range => range.key).join(', ');
      expect(keys).to.eql(input);
    });

    it('adjusts rows/columns', () => {
      const test = (input: string, output: string) => {
        const union = fromKey(input);
        const res = union.formated({ totalColumns: 10, totalRows: 10 });
        const keys = res.ranges.map(range => range.key).join(', ');
        expect(keys).to.eql(output);
      };

      test('A1:A10', 'A:A');
      test('A1:B10', 'A:B');
      test('A1:F10', 'A:F');

      test('A1:J1', '1:1');
      test('A1:J2', '1:2');
      test('A1:J9', '1:9');

      test('A1:A10, B1:B10', 'A:A, B:B');
      test('A1:A10, A1:J1', 'A:A, 1:1');
      test('A1:A10, A1:J1, B2:C4', 'A:A, 1:1, B2:C4');
    });
  });

  describe('axis', () => {
    it('axis.keys', () => {
      const test = (axis: t.CoordAxis, input: string, output: string[]) => {
        const union = fromKey(input);
        expect(union.axis(axis).keys).to.eql(output);
      };
      test('COLUMN', 'A:B', ['A', 'B']);
      test('COLUMN', 'A:B, A:C, C:D, B2:D5', ['A', 'B', 'C', 'D']);

      test('ROW', '1:2', ['1', '2']);
      test('ROW', '1:3, 2:4, B2:Z5', ['1', '2', '3', '4', '5']);
    });

    it('column.keys', () => {
      const test = (input: string, output: string[]) => {
        const union = fromKey(input);
        expect(union.column.keys).to.eql(output);
      };
      test('A:B', ['A', 'B']);
      test('A:B, A:C, C:D, B2:D5', ['A', 'B', 'C', 'D']);
    });

    it('row.keys', () => {
      const test = (input: string, output: string[]) => {
        const union = fromKey(input);
        expect(union.row.keys).to.eql(output);
      };
      test('1:2', ['1', '2']);
      test('1:3, 2:4, B2:Z5', ['1', '2', '3', '4', '5']);
    });
  });
});
