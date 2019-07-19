import { expect } from 'chai';
import { SyncSchema } from '.';

describe('schema.db', () => {
  const schema = SyncSchema.create({});

  it('toKey (derive type)', () => {
    const test = (key: any, expected: any) => {
      const res = schema.db.toKey(key);
      expect(res).to.eql(expected);
    };
    test('A1', 'cell/A1');
    test('A', 'column/A');
    test('1', 'row/1');
    test(1, 'row/1');
    test({ key: 'A1' }, 'cell/A1');
    test({ key: 'A' }, 'column/A');
    test({ key: '1' }, 'row/1');
    test({ key: 1 }, 'row/1');
    test(undefined, '');
    test({ key: undefined }, '');
  });

  it('toCellKey', () => {
    const test = (key: any, expected: any) => {
      const res = schema.db.toCellKey(key);
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

  it('toRowKey', () => {
    const test = (key: any, expected: any) => {
      const res = schema.db.toRowKey(key);
      expect(res).to.eql(expected);
    };
    test('1', 'row/1');
    test(1, 'row/1');
    test('row/1', 'row/1');
  });

  it('toColumnKey', () => {
    const test = (key: any, expected: any) => {
      const res = schema.db.toColumnKey(key);
      expect(res).to.eql(expected);
    };
    test('A', 'column/A');
    test(0, 'column/A');
    test(1, 'column/B');
    test('column/A', 'column/A');
    test('FOO/A', 'column/A');
  });

  it('all (find)', () => {
    expect(schema.db.all.cells).to.eql('cell/*');
    expect(schema.db.all.rows).to.eql('row/*');
    expect(schema.db.all.columns).to.eql('column/*');
  });

  describe('is', () => {
    it('is.cell', () => {
      const test = (input: string, output: boolean) => {
        expect(schema.db.is.cell(input)).to.eql(output);
      };
      test('cell/A1', true);
      test('A1', false);
      test('row/1', false);
      test('column/A', false);
    });

    it('is.column', () => {
      const test = (input: string, output: boolean) => {
        expect(schema.db.is.column(input)).to.eql(output);
      };
      test('column/A', true);
      test('A', false);
      test('row/1', false);
      test('cell/A1', false);
    });

    it('is.row', () => {
      const test = (input: string, output: boolean) => {
        expect(schema.db.is.row(input)).to.eql(output);
      };
      test('row/1', true);
      test('1', false);
      test('column/A', false);
      test('cell/A1', false);
    });
  });
});
