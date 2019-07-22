import { expect } from 'chai';
import { cell } from '.';

type CellInput = string | number | { column?: number; row?: number } | { key: string };

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
    const test = (input: CellInput, key: string, column: number, row: number) => {
      const res = cell.toCell(input);
      expect(res.key).to.eql(key);
      expect(res.column).to.eql(column);
      expect(res.row).to.eql(row);
    };
    test('A1', 'A1', 0, 0);
    test({ key: 'A1' }, 'A1', 0, 0);
    test('$A$1', '$A$1', 0, 0);
    test({ key: '$A$1' }, '$A$1', 0, 0);
    test('A$1', 'A$1', 0, 0);
    test('$A1', '$A1', 0, 0);
    test('A', 'A', 0, -1);
    test('1', '1', -1, 0);
    test(1, '1', -1, 0);
    test({ column: 0, row: 0 }, 'A1', 0, 0);
    test({ column: 0 }, 'A', 0, -1);
    test({ row: 0 }, '1', -1, 0);
  });

  it('strips "$"', () => {
    const test = (input: CellInput, key: string) => {
      const res = cell.toCell(input, { relative: true });
      expect(res.key).to.eql(key);
    };
    test('$A$1', 'A1');
    test('A$1', 'A1');
    test('$A1', 'A1');
    test('$A', 'A');
    test('$1', '1');
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
    const test = (a: CellInput, b: CellInput, output: number) => {
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
    const test = (a: CellInput, b: CellInput, output: number) => {
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
