import { expect } from 'chai';
import { cell } from '.';

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
    const test = (key: string, row: number, column: number) => {
      const res = cell.fromKey(key);
      expect(res.row).to.eql(row);
      expect(res.column).to.eql(column);
    };
    test('A1', 0, 0);
    test('$A1', 0, 0);
    test('$A$1', 0, 0);
    test('A$1', 0, 0);
    test('Sheet1!A1', 0, 0);
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
});
