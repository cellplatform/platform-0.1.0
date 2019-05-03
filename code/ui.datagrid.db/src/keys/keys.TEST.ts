import { expect } from 'chai';
import { Keys } from './keys';

describe('Sync', () => {
  describe('(static)', () => {
    it('toDbCellKey', () => {
      const keys = Keys.create({});
      const test = (key: any, expected: any) => {
        const res = keys.db.toCellKey(key);
        expect(res).to.eql(expected);
      };
      test('A1', 'cell/A1');
      test('cell/A1', 'cell/A1');
      test('///cell/A1', 'cell/A1');
      test('FOO/A1', 'cell/A1');
      test({ key: 'A1' }, 'cell/A1');
      test({ key: '/cell/A1' }, 'cell/A1');
      test(undefined, '');
      test({ key: undefined }, '');
    });

    it('toDbRowKey', () => {
      const keys = Keys.create({});
      const test = (key: any, expected: any) => {
        const res = keys.db.toRowKey(key);
        expect(res).to.eql(expected);
      };
      test('1', 'row/1');
      test(1, 'row/1');
      test('row/1', 'row/1');
    });

    it('toDbColumnKey', () => {
      const keys = Keys.create({});
      const test = (key: any, expected: any) => {
        const res = keys.db.toColumnKey(key);
        expect(res).to.eql(expected);
      };
      test('A', 'column/A');
      test(0, 'column/A');
      test(1, 'column/B');
      test('column/A', 'column/A');
      test('FOO/A', 'column/A');
    });

    it('toGridCellKey', () => {
      const keys = Keys.create({});
      const test = (key: any, expected: any) => {
        const res = keys.grid.toCellKey(key);
        expect(res).to.eql(expected);
      };
      test('A1', 'A1');
      test('a1', 'A1');
      test('cell/A1', 'A1');
      test('///foo/cell/A1', 'A1');
      test(undefined, '');
    });
  });
});
