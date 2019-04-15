import { expect } from 'chai';
import { Sync } from '.';

describe('Sync', () => {
  describe('(static)', () => {
    it('toDbCellKey', () => {
      const test = (key: any, expected: any) => {
        const res = Sync.toDbCellKey(key);
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

    it('toGridCellKey', () => {
      const test = (key: any, expected: any) => {
        const res = Sync.toGridCellKey(key);
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
