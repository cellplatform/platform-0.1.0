import { expect } from 'chai';
import { cell } from '.';

describe('cell.offset', () => {
  const test = (
    cellKey: string,
    columnOffset: number,
    rowOffset: number,
    result: undefined | string,
    options?: cell.IGridCellOffsetOptions,
  ) => {
    const res = cell.offset(cellKey, columnOffset, rowOffset, options);
    const msg = `cell: "${cellKey}", columnOffset: "${columnOffset}", rowOffset: ${rowOffset}`;
    if (result === undefined) {
      expect(res).to.eql(undefined, msg);
    } else {
      expect(res).to.eql(result, msg);
    }
  };

  it('up', () => {
    test('A1', 0, -1, undefined);
    test('A2', 0, -1, 'A1');
    test('A3', 0, -10, undefined);
    test('A3', 0, -10, 'A1', { clamp: true });
  });

  it('right', () => {
    test('A1', 1, 0, 'B1');
    test('C1', 1, 0, undefined, { totalColumns: 3 });
    test('C1', 10, 0, undefined, { totalColumns: 5 });
    test('C1', 10, 0, 'E1', { totalColumns: 5, clamp: true });
  });

  it('bottom', () => {
    test('A1', 0, 1, 'A2');
    test('A3', 0, 1, undefined, { totalRows: 3 });
    test('A1', 0, 4, undefined, { totalRows: 3 });
    test('A1', 0, 4, 'A3', { totalRows: 3, clamp: true });
  });

  it('left', () => {
    test('A1', -1, 0, undefined);
    test('B1', -1, 0, 'A1');
    test('C1', -10, 0, undefined);
    test('C1', -10, 0, 'A1', { clamp: true });
  });
});

describe('sibling', () => {
  const test = (
    cellKey: string,
    edge: cell.GridCellEdge,
    result: undefined | string,
    options?: cell.IGridCellSiblingOptions,
  ) => {
    const res = cell.sibling(cellKey, edge, options);
    const msg = `cell: "${cellKey}", edge: "${edge}"`;
    if (result === undefined) {
      expect(res).to.eql(undefined, msg);
    } else {
      expect(res).to.eql(result, msg);
    }
  };

  it('top', () => {
    test('A1', 'TOP', undefined);
    test('B2', 'TOP', 'B1');
    test('A3', 'TOP', undefined, { offset: 4 });
    test('A3', 'TOP', 'A1', { offset: 4, clamp: true });
  });

  it('right', () => {
    test('A1', 'RIGHT', 'B1');
    test('C1', 'RIGHT', undefined, { totalColumns: 3 });
    test('C1', 'RIGHT', undefined, { totalColumns: 5, offset: 10 });
    test('C1', 'RIGHT', 'E1', { totalColumns: 5, offset: 10, clamp: true });
  });

  it('bottom', () => {
    test('A1', 'BOTTOM', 'A2');
    test('A3', 'BOTTOM', undefined, { totalRows: 3 });
    test('A1', 'BOTTOM', undefined, { totalRows: 3, offset: 4 });
    test('A1', 'BOTTOM', 'A3', { totalRows: 3, offset: 4, clamp: true });
  });

  it('left', () => {
    test('A1', 'LEFT', undefined);
    test('B1', 'LEFT', 'A1');
    test('C1', 'LEFT', undefined, { offset: 10 });
    test('C1', 'LEFT', 'A1', { offset: 10, clamp: true });
  });
});

describe('siblings', () => {
  it('oppositeEdge', () => {
    expect(cell.oppositeEdge('TOP')).to.eql('BOTTOM');
    expect(cell.oppositeEdge('RIGHT')).to.eql('LEFT');
    expect(cell.oppositeEdge('BOTTOM')).to.eql('TOP');
    expect(cell.oppositeEdge('LEFT')).to.eql('RIGHT');
  });

  it('top/left', () => {
    const res = cell.siblings('A$1');
    expect(res.top).to.eql(undefined);
    expect(res.left).to.eql(undefined);
    expect(res.right).to.eql('B1');
    expect(res.bottom).to.eql('A2');
  });

  it('top/right', () => {
    const res = cell.siblings('E1', { totalColumns: 5, totalRows: 10 });
    expect(res.top).to.eql(undefined);
    expect(res.right).to.eql(undefined);
    expect(res.left).to.eql('D1');
    expect(res.bottom).to.eql('E2');
  });

  it('bottom/right', () => {
    const res = cell.siblings('$E10', { totalColumns: 5, totalRows: 10 });
    expect(res.right).to.eql(undefined);
    expect(res.bottom).to.eql(undefined);
    expect(res.left).to.eql('D10');
    expect(res.top).to.eql('E9');
  });

  it('bottom/left', () => {
    const res = cell.siblings('A10', { totalColumns: 5, totalRows: 10 });
    expect(res.left).to.eql(undefined);
    expect(res.bottom).to.eql(undefined);
    expect(res.right).to.eql('B10');
    expect(res.top).to.eql('A9');
  });

  it('middle (all sides)', () => {
    const res = cell.siblings('B3', { totalColumns: 5, totalRows: 10 });
    expect(res.left).to.eql('A3');
    expect(res.right).to.eql('C3');
    expect(res.top).to.eql('B2');
    expect(res.bottom).to.eql('B4');
  });

  it('no upper bounds - has all sides (totalColumns, totalRows)', () => {
    const res = cell.siblings('AAA999');
    expect(res.left).to.eql('ZZ999');
    expect(res.right).to.eql('AAB999');
    expect(res.top).to.eql('AAA998');
    expect(res.bottom).to.eql('AAA1000');
  });
});

describe('siblings (offset)', () => {
  it('offset: 0/undefined', () => {
    const offset = (offset?: number) => {
      const res = cell.siblings('E10', { offset: 0 });
      expect(res.left).to.eql('D10');
      expect(res.right).to.eql('F10');
      expect(res.top).to.eql('E9');
      expect(res.bottom).to.eql('E11');
    };
    offset(0);
    offset(undefined);
  });

  it('offsets by 3', () => {
    const res = cell.siblings('E10', { offset: 3 });
    expect(res.left).to.eql('B10');
    expect(res.right).to.eql('H10');
    expect(res.top).to.eql('E7');
    expect(res.bottom).to.eql('E13');
  });

  it('clamp (undefined siblings clamp to closest sibling Cell)', () => {
    const res = cell.siblings('C3', {
      offset: 20,
      totalColumns: 5,
      totalRows: 5,
      clamp: true,
    });
    expect(res.left).to.eql('A3');
    expect(res.right).to.eql('E3');
    expect(res.top).to.eql('C1');
    expect(res.bottom).to.eql('C5');
  });
});
