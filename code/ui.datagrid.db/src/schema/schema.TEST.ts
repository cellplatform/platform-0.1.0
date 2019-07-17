import { expect } from 'chai';
import { SyncSchema } from '.';

describe('keys', () => {
  it('toDbCellKey', () => {
    const keys = SyncSchema.create({});
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
    const keys = SyncSchema.create({});
    const test = (key: any, expected: any) => {
      const res = keys.db.toRowKey(key);
      expect(res).to.eql(expected);
    };
    test('1', 'row/1');
    test(1, 'row/1');
    test('row/1', 'row/1');
  });

  it('toDbColumnKey', () => {
    const keys = SyncSchema.create({});
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
    const keys = SyncSchema.create({});
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

  describe('db', () => {
    it('all (find)', () => {
      const keys = SyncSchema.create({});
      expect(keys.db.all.cells).to.eql('cell/*');
      expect(keys.db.all.rows).to.eql('row/*');
      expect(keys.db.all.columns).to.eql('column/*');
    });

    describe('is', () => {
      const keys = SyncSchema.create({});
      it('is.cell', () => {
        const test = (input: string, output: boolean) => {
          expect(keys.db.is.cell(input)).to.eql(output);
        };
        test('cell/A1', true);
        test('A1', false);
        test('row/1', false);
        test('column/A', false);
      });

      it('is.column', () => {
        const test = (input: string, output: boolean) => {
          expect(keys.db.is.column(input)).to.eql(output);
        };
        test('column/A', true);
        test('A', false);
        test('row/1', false);
        test('cell/A1', false);
      });

      it('is.row', () => {
        const test = (input: string, output: boolean) => {
          expect(keys.db.is.row(input)).to.eql(output);
        };
        test('row/1', true);
        test('1', false);
        test('column/A', false);
        test('cell/A1', false);
      });
    });
  });
});
