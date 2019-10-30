import { expect } from 'chai';
import { cell } from '.';
import { t } from '../common';

describe('cell', () => {
  describe('toKey', () => {
    it('CELL (0, 0) => "A1"', () => {
      expect(cell.toKey(0, 0)).to.eql('A1');
    });

    it('CELL (0, 4) => "A5"', () => {
      expect(cell.toKey(0, 4)).to.eql('A5');
    });

    it('COLUMN (2, -1) => "C"', () => {
      expect(cell.toKey(2, -1)).to.eql('C');
      expect(cell.toKey(2, -2)).to.eql('C');
    });

    it('ROW (-1, 4) => "5"', () => {
      expect(cell.toKey(-1, 4)).to.eql('5');
      expect(cell.toKey(-2, 4)).to.eql('5');
    });

    it('ALL (-1, -1)', () => {
      expect(cell.toKey(-1, -1)).to.eql('*');
      expect(cell.toKey(-2, -2)).to.eql('*');
      expect(cell.toKey(undefined, undefined)).to.eql('*');
    });
  });

  describe('fromKey', () => {
    it('parses from string', () => {
      const test = (key: string | number, row: number, column: number) => {
        const res = cell.fromKey(key);
        expect(res.row).to.eql(row);
        expect(res.column).to.eql(column);
      };
      test('A1', 0, 0);
      test('$A1', 0, 0);
      test('$A$1', 0, 0);
      test('A$1', 0, 0);
      test('Sheet1!A1', 0, 0);
      test('1', 0, -1);
      test(1, 0, -1);
      test('A', -1, 0);
    });

    it('is invalid', () => {
      const test = (key: string) => {
        const res = cell.fromKey(key);
        expect(res.row).to.eql(-1);
        expect(res.column).to.eql(-1);
      };
      test('');
      test('Sheet1!');
    });
  });

  describe('toCell', () => {
    it('toCell', () => {
      const test = (
        input: cell.CellInput,
        key: string,
        column: number,
        row: number,
        ns: string = '',
      ) => {
        const res = cell.toCell(input);
        expect(res.key).to.eql(key);
        expect(res.ns).to.eql(ns);
        expect(res.column).to.eql(column);
        expect(res.row).to.eql(row);
      };
      test('A1', 'A1', 0, 0);
      test('abc!A1', 'A1', 0, 0, 'abc');
      test('  abc!A1  ', 'A1', 0, 0, 'abc');
      test({ key: 'A1' }, 'A1', 0, 0);
      test({ key: 'B2', ns: '' }, 'B2', 1, 1);
      test({ key: 'C3', ns: 'foo' }, 'C3', 2, 2, 'foo');
      test({ key: 'A1', ns: '   ' }, 'A1', 0, 0, '');
      test({ key: 'A1', ns: ' foo ' }, 'A1', 0, 0, 'foo');
      test({ key: 'A1', ns: ' foo! ' }, 'A1', 0, 0, 'foo');
      test('$A$1', '$A$1', 0, 0);
      test({ key: '$A$1' }, '$A$1', 0, 0);
      test('A$1', 'A$1', 0, 0);
      test('$A1', '$A1', 0, 0);
      test('A', 'A', 0, -1);
      test('1', '1', -1, 0);
      test(0, '1', -1, 0);
      test(1, '2', -1, 1);
      test({ column: 0, row: 0 }, 'A1', 0, 0);
      test({ column: 0, row: 0, ns: 'foo' }, 'A1', 0, 0, 'foo');
      test({ column: 0, row: 0, ns: '  foo!  ' }, 'A1', 0, 0, 'foo');
      test({ column: 0 }, 'A', 0, -1);
      test({ row: 0 }, '1', -1, 0);
    });

    it('strips "$"', () => {
      const test = (input: cell.CellInput, key: string) => {
        const res = cell.toCell(input, { relative: true });
        expect(res.key).to.eql(key);
      };
      test('$A$1', 'A1');
      test('A$1', 'A1');
      test('$A1', 'A1');
      test('$A', 'A');
      test('$1', '1');
    });

    it('error: invalid input object', () => {
      const test = (input: any) => {
        const fn = () => cell.toCell(input);
        expect(fn).to.throw(/Could not derive coord position for cell input/);
      };
      test({});
      test({ foo: 123 });
    });
  });

  describe('isRangeKey', () => {
    it('is a range', () => {
      expect(cell.isRangeKey('F39:F41')).to.eql(true);
      expect(cell.isRangeKey('F:F')).to.eql(true);
      expect(cell.isRangeKey(' F:F ')).to.eql(true);
      expect(cell.isRangeKey('48:48')).to.eql(true);
      expect(cell.isRangeKey(' 48:48  ')).to.eql(true);
    });
    it('is a range (mixed position)', () => {
      expect(cell.isRangeKey('$F:F')).to.eql(true);
      expect(cell.isRangeKey('F:$F')).to.eql(true);
      expect(cell.isRangeKey('$5:5')).to.eql(true);
      expect(cell.isRangeKey('5:$5')).to.eql(true);
    });
    it('is a range (sheet)', () => {
      expect(cell.isRangeKey('Sheet1!F39:F41')).to.eql(true);
      expect(cell.isRangeKey('Sheet1!F:F')).to.eql(true);
      expect(cell.isRangeKey(' Sheet1!F:F ')).to.eql(true);
      expect(cell.isRangeKey('Sheet1!48:48')).to.eql(true);
      expect(cell.isRangeKey(' Sheet1!48:48  ')).to.eql(true);
    });
    it('is not a range', () => {
      expect(cell.isRangeKey('')).to.eql(false);
      expect(cell.isRangeKey(' ')).to.eql(false);
      expect(cell.isRangeKey('F39')).to.eql(false);
      expect(cell.isRangeKey('39')).to.eql(false);
      expect(cell.isRangeKey('39:')).to.eql(false);
      expect(cell.isRangeKey('I:')).to.eql(false);
      expect(cell.isRangeKey(':52')).to.eql(false);
      expect(cell.isRangeKey('48:48:')).to.eql(false);
      expect(cell.isRangeKey('48:48: ')).to.eql(false);
      expect(cell.isRangeKey('F :F')).to.eql(false);
      expect(cell.isRangeKey('F: F')).to.eql(false);
      expect(cell.isRangeKey('$A$1')).to.eql(false);
      expect(cell.isRangeKey('A$1')).to.eql(false);
      expect(cell.isRangeKey('$A1')).to.eql(false);
    });

    describe('toType (COLUMM, ROW)', () => {
      it('converts to type cell type', () => {
        expect(cell.toType('A')).to.eql('COLUMN');
        expect(cell.toType('AA')).to.eql('COLUMN');
        expect(cell.toType('1')).to.eql('ROW');
        expect(cell.toType(1)).to.eql('ROW');
        expect(cell.toType('99')).to.eql('ROW');
        expect(cell.toType('A1')).to.eql('CELL');
        expect(cell.toType('Z9')).to.eql('CELL');

        expect(cell.toType({ row: 0, column: -1 })).to.eql('ROW');
        expect(cell.toType({ row: 0 })).to.eql('ROW');

        expect(cell.toType({ row: -1, column: 0 })).to.eql('COLUMN');
        expect(cell.toType({ column: 0 })).to.eql('COLUMN');

        expect(cell.toType({ key: 'A1' })).to.eql('CELL');
        expect(cell.toType({ key: 'A1', row: 0, column: 0 })).to.eql('CELL');
        expect(cell.toType({ row: 0, column: 0 })).to.eql('CELL');
        expect(cell.toType({ row: 123, column: 456 })).to.eql('CELL');
      });

      it('non-valid input returns nothing', () => {
        expect(cell.toType(undefined as any)).to.eql(undefined);
        expect(cell.toType('')).to.eql(undefined);
        expect(cell.toType('  ')).to.eql(undefined);
        expect(cell.toType({ row: -1, column: -1 })).to.eql(undefined);
        expect(cell.toType({ row: undefined, column: undefined })).to.eql(undefined);
        expect(cell.toType({})).to.eql(undefined);
      });
    });
  });

  describe('compare', () => {
    it('by COLUMN (default)', () => {
      const test = (a: cell.CellInput, b: cell.CellInput, output: number) => {
        expect(cell.comparer(a, b)).to.eql(output);
      };

      test('A', 'A', 0);
      test({ key: 'A' }, 'A', 0);
      test({ column: 0, row: -1 }, { column: 0, row: -1 }, 0);

      test('1', '1', 0);
      test(1, 1, 0);
      test({ key: '1' }, '1', 0);
      test({ column: -1, row: 0 }, { column: -1, row: 0 }, 0);

      test('A1', 'A1', 0);
      test('Z9', 'Z9', 0);
      test({ key: 'A1' }, 'A1', 0);
      test({ column: 0, row: 0 }, { column: 0, row: 0 }, 0);

      test('A1', 'A2', -1);
      test('A1', 'B1', -1);
      test('A1', 'ZZ99', -1);
      test({ key: 'A1' }, 'A2', -1);
      test({ column: 0, row: 0 }, { column: 1, row: 0 }, -1);
      test({ column: 0, row: 0 }, { column: 1, row: 1 }, -1);
      test({ column: 1, row: 0 }, { column: 1, row: 1 }, -1);

      test('A2', 'A1', 1);
      test('B1', 'A1', 1);
      test('ZZ99', 'A1', 1);
      test({ key: 'A2' }, 'A1', 1);
      test({ column: 1, row: 0 }, { column: 0, row: 0 }, 1);
      test({ column: 1, row: 2 }, { column: 0, row: 0 }, 1);
    });

    it('by ROW', () => {
      const test = (a: cell.CellInput, b: cell.CellInput, output: number) => {
        expect(cell.comparer(a, b, { axis: 'ROW' })).to.eql(output);
      };

      test('A1', 'A1', 0);
      test('A', 'A', 0);
      test('1', '1', 0);
      test({ key: '1' }, '1', 0);

      test('A1', 'B1', -1);
      test('A1', 'A2', -1);
      test('A', 'B', -1);
      test('1', '2', -1);
      test({ key: '1' }, '2', -1);

      test('B1', 'A1', 1);
      test('A2', 'A1', 1);
      test('B', 'A', 1);
      test('2', '1', 1);
      test({ key: '2' }, '1', 1);
    });
  });

  describe('sort', () => {
    const list = ['C1', 'A2', 'B2', 'B1', 'A1', 'B3', 'A9'];
    const sorted = {
      byColumn: ['A1', 'A2', 'A9', 'B1', 'B2', 'B3', 'C1'],
      byRow: ['A1', 'B1', 'C1', 'A2', 'B2', 'B3', 'A9'],
    };

    it('by COLUMN (default)', () => {
      const res = cell.sort(list);
      expect(res).to.eql(sorted.byColumn);
    });

    it('by ROW', () => {
      const res = cell.sort(list, { by: 'ROW' });
      expect(res).to.eql(sorted.byRow);
    });

    it('sorts by {key}', () => {
      const keys = list.map(key => ({ key, value: `value-${key}` }));

      const byColumn = cell.sort(keys); // Default: by COLUMN
      const byRow = cell.sort(keys, { by: 'ROW' });

      const columns = byColumn.map(m => m.key);
      const rows = byRow.map(m => m.key);

      expect(columns).to.eql(sorted.byColumn);
      expect(rows).to.eql(sorted.byRow);
    });
  });

  describe('min/max', () => {
    const list = ['C1', 'B2', 'B1', 'C9', 'D3'];

    it('min/max - undefined', () => {
      const test = (input: cell.CellInput[]) => {
        expect(cell.min.row(input)).to.eql(-1);
        expect(cell.min.column(input)).to.eql(-1);
        expect(cell.max.row(input)).to.eql(-1);
        expect(cell.max.column(input)).to.eql(-1);
      };

      test([]);
      test(['']);
      test([undefined as any, '']);
    });

    it('min.row', () => {
      const res1 = cell.min.by('ROW', list);
      const res2 = cell.min.row(list);
      expect(res1 && res1).to.eql(0);
      expect(res1).to.eql(res2);
    });

    it('min.column', () => {
      const res1 = cell.min.by('COLUMN', list);
      const res2 = cell.min.column(list);
      expect(res1).to.eql(1);
      expect(res1).to.eql(res2);
    });

    it('max.row', () => {
      const res1 = cell.max.by('ROW', list);
      const res2 = cell.max.row(list);
      expect(res1 && res1).to.eql(8);
      expect(res1).to.eql(res2);
    });

    it('max.column', () => {
      const res1 = cell.max.by('COLUMN', list);
      const res2 = cell.max.column(list);
      expect(res1 && res1).to.eql(3);
      expect(res1).to.eql(res2);
    });
  });

  describe('to column/row', () => {
    it('toAxisIndex', () => {
      const test = (axis: t.CoordAxis, input: cell.CellInput, output: number) => {
        const res = cell.toAxisIndex(axis, input);
        expect(res).to.eql(output);
      };
      test('COLUMN', 'A', 0);
      test('COLUMN', 'A3', 0);
      test('COLUMN', '1', -1);
      test('COLUMN', 1, -1);

      test('ROW', 'A3', 2);
      test('ROW', '3', 2);
      test('ROW', 2, 2);
    });

    it('toAxisKey', () => {
      const test = (axis: t.CoordAxis, input: cell.CellInput, output: string) => {
        const res = cell.toAxisKey(axis, input);
        expect(res).to.eql(output);
      };
      test('COLUMN', 'A', 'A');
      test('COLUMN', 'A3', 'A');
      test('COLUMN', '1', ''); // Row - not valid.
      test('COLUMN', 0, 'A');
      test('COLUMN', 1, 'B');

      test('ROW', 'A', ''); // Column - not valid.
      test('ROW', 'A3', '3');
      test('ROW', '1', '1');
      test('ROW', 0, '1');
      test('ROW', 1, '2');
    });

    it('toColumnKey', () => {
      const test = (input: cell.CellInput, output: string) => {
        const res = cell.toColumnKey(input);
        expect(res).to.eql(output);
      };
      test('A', 'A');
      test('A3', 'A');
      test('1', ''); // Row - not valid.
      test(0, 'A');
      test(1, 'B');
    });

    it('toRowKey', () => {
      const test = (input: cell.CellInput, output: string) => {
        const res = cell.toRowKey(input);
        expect(res).to.eql(output);
      };
      test('A', ''); // Column - not valid.
      test('A3', '3');
      test('1', '1');
      test(0, '1');
      test(1, '2');
    });

    it('toAxisRangeKey', () => {
      const test = (axis: t.CoordAxis, input: cell.CellInput, output: string) => {
        const res = cell.toAxisRangeKey(axis, input);
        expect(res).to.eql(output);
      };
      test('COLUMN', 'A3', 'A:A');
      test('COLUMN', 'A', 'A:A');
      test('COLUMN', '1', ''); // Row - not valid.
      test('COLUMN', 0, 'A:A');
      test('COLUMN', 1, 'B:B');

      test('ROW', 'A3', '3:3');
      test('ROW', 'A', ''); // Column - not valid.
      test('ROW', '1', '1:1');
      test('ROW', 0, '1:1');
      test('ROW', 1, '2:2');
    });

    it('toColumnRangeKey', () => {
      const test = (input: cell.CellInput, output: string) => {
        const res = cell.toColumnRangeKey(input);
        expect(res).to.eql(output);
      };
      test('A3', 'A:A');
      test('A', 'A:A');
      test('1', ''); // Row - not valid.
      test(0, 'A:A');
      test(1, 'B:B');
    });

    it('toRowRangeKey', () => {
      const test = (input: cell.CellInput, output: string) => {
        const res = cell.toRowRangeKey(input);
        expect(res).to.eql(output);
      };
      test('A3', '3:3');
      test('A', ''); // Column - not valid.
      test('1', '1:1');
      test(0, '1:1');
      test(1, '2:2');
    });
  });

  describe('is type', () => {
    it('isCell', () => {
      const test = (input: cell.CellInput, expected?: boolean) => {
        expect(cell.isCell(input)).to.eql(expected);
      };
      test('A1', true);
      test({ key: 'A1' }, true);

      test('A', false);
      test('1', false);
      test(2, false);
      test({ key: 'A' }, false);

      test('A:A', false);
      test('1:1', false);
      test('A1:A2', false);
    });

    it('isColumn', () => {
      const test = (input: cell.CellInput, expected?: boolean) => {
        expect(cell.isColumn(input)).to.eql(expected);
      };
      test('A', true);
      test({ key: 'A' }, true);

      test('A1', false);
      test('1', false);
      test({ key: 'A1' }, false);
      test({ key: '1' }, false);

      test('A:A', false);
      test('1:1', false);
      test('A1:A2', false);
    });

    it('isRow', () => {
      const test = (input: cell.CellInput, expected?: boolean) => {
        expect(cell.isRow(input)).to.eql(expected);
      };
      test(1, true);
      test('1', true);
      test({ key: '1' }, true);

      test('A1', false);
      test('A', false);
      test({ key: 'A1' }, false);
      test({ key: 'B' }, false);

      test('A:A', false);
      test('1:1', false);
      test('A1:A2', false);
    });
  });

  describe('is axis range', () => {
    it('axisRangeType', () => {
      const test = (input: string, expected?: t.CoordAxis) => {
        expect(cell.axisRangeType(input)).to.eql(expected);
      };
      test('A:A', 'COLUMN');
      test('A:B', 'COLUMN');
      test('B:A', 'COLUMN');
      test('1:10', 'ROW');

      test('B1:Z9', undefined);
      test('Z9', undefined);
    });

    it('isAxisRangeKey', () => {
      const test = (input: string, axis: t.CoordAxis | undefined, expected: boolean) => {
        expect(cell.isAxisRangeKey(input, axis)).to.eql(expected);
      };
      test('A:A', undefined, true);
      test('A:B', undefined, true);
      test('B:A', undefined, true);
      test('1:10', undefined, true);

      test('A:B', 'COLUMN', true);
      test('1:10', 'ROW', true);

      test('B1:Z9', undefined, false);
      test('Z9', undefined, false);

      test('A:B', 'ROW', false);
      test('1:10', 'COLUMN', false);
    });

    it('isColumnRangeKey', () => {
      const test = (input: string, expected: boolean) => {
        expect(cell.isColumnRangeKey(input)).to.eql(expected);
      };
      test('A:A', true);
      test('A:B', true);
      test('1:10', false);

      test('B1:Z9', false);
      test('Z9', false);
    });

    it('isRowRangeKey', () => {
      const test = (input: string, expected: boolean) => {
        expect(cell.isRowRangeKey(input)).to.eql(expected);
      };
      test('A:B', false);
      test('1:10', true);

      test('B1:Z9', false);
      test('Z9', false);
    });
  });
});
