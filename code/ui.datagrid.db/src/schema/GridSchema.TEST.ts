import { expect } from 'chai';
import { SyncSchema } from '.';

describe('schema.grid', () => {
  const schema = SyncSchema.create({});

  it('toKey', () => {
    const test = (key: any, expected: any) => {
      const res = schema.grid.toKey(key);
      expect(res).to.eql(expected);
    };

    test('A1', 'A1');
    test('cell/A1', 'A1');
    test('cell///A1', 'A1');
    test('row/1', '1');
    test('column/A', 'A');
  });

  it('toCellKey', () => {
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

  it('toColumnKey', () => {
    const test = (key: any, expected: any) => {
      const res = schema.grid.toColumnKey(key);
      expect(res).to.eql(expected);
    };
    test('A', 'A');
    test(0, 'A');
    test(1, 'B');
    test('column/A', 'A');
  });

  it('toRowKey', () => {
    const test = (key: any, expected: any) => {
      const res = schema.grid.toRowKey(key);
      expect(res).to.eql(expected);
    };
    test('1', '1');
    test(0, '1');
    test(1, '2');
    test('row/1', '1');
  });
});
