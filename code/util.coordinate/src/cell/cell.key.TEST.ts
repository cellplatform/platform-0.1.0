import { expect } from '../../../test';
import { cell } from '.';

describe('toCellKey', () => {
  it('CELL (0, 0) => "A1"', () => {
    expect(cell.toCellKey(0, 0)).to.eql('A1');
  });

  it('CELL (0, 4) => "A5"', () => {
    expect(cell.toCellKey(0, 4)).to.eql('A5');
  });

  it('COLUMN (2, -1) => "C"', () => {
    expect(cell.toCellKey(2, -1)).to.eql('C');
    expect(cell.toCellKey(2, -2)).to.eql('C');
  });

  it('ROW (-1, 4) => "5"', () => {
    expect(cell.toCellKey(-1, 4)).to.eql('5');
    expect(cell.toCellKey(-2, 4)).to.eql('5');
  });

  it('ALL (-1, -1)', () => {
    expect(cell.toCellKey(-1, -1)).to.eql('*');
    expect(cell.toCellKey(-2, -2)).to.eql('*');
    expect(cell.toCellKey(undefined, undefined)).to.eql('*');
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
