import { expect } from 'chai';
import { SyncSchema } from '.';

describe('schema.grid', () => {
  const schema = SyncSchema.create({});

  it('toGridCellKey', () => {
    const test = (key: any, expected: any) => {
      const res = schema.grid.toCellKey(key);
      expect(res).to.eql(expected);
    };
    test('A1', 'A1');
    test('a1', 'A1');
    test('cell/A1', 'A1');
    test('///foo/cell/A1', 'A1');
    test(undefined, '');
  });
});
