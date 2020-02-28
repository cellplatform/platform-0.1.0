import { expect, t } from '../test';
import { TypeTarget } from './TypeTarget';

describe('TypeTarget', () => {
  it('invalid', () => {
    const test = (input: any) => {
      const info = TypeTarget.cell(input);
      expect(info.isValid).to.eql(false);
      expect(info.isRef).to.eql(false);
      expect(info.isValid).to.eql(false);
      expect(info.kind).to.eql('UNKNOWN');
      expect(info.errors.length).to.eql(1);
      expect(info.path).to.eql('');
    };
    test('foo');
    test('foobar');
  });

  it('kind: inline (value)', () => {
    const test = (input?: string) => {
      const info = TypeTarget.cell(input);
      expect(info.target).to.eql('inline');
      expect(info.kind).to.eql('inline');
      expect(info.isValid).to.eql(true);
      expect(info.errors).to.eql([]);
      expect(info.isRef).to.eql(false);
      expect(info.isValid).to.eql(true);
    };
    test(undefined);
    test('');
    test('inline');
    test('  inline  ');
  });

  it('kind: ref', () => {
    const info = TypeTarget.cell('ref');
    expect(info.target).to.eql('ref');
    expect(info.kind).to.eql('ref');
    expect(info.isValid).to.eql(true);
    expect(info.isRef).to.eql(true);
    expect(info.isInline).to.eql(false);
    expect(info.errors).to.eql([]);
  });

  it('path: inline (value)', () => {
    const test = (input: string) => {
      const info = TypeTarget.cell(input);
      expect(info.path).to.eql('value');
    };
    test('inline');
    test('  inline  ');
    test('');
    test('   ');
  });

  it('path: inline (props)', () => {
    const test = (input: string, path: string) => {
      const info = TypeTarget.cell(input);
      expect(info.path).to.eql(path);
    };
    test('inline:foo', 'props:foo');
    test('inline:foo.bar', 'props:foo.bar');
  });

  it('path: ref', () => {
    const test = (input: string, path: string) => {
      const info = TypeTarget.cell(input);
      expect(info.path).to.eql(path);
    };
    test('ref', 'ref:type');
  });

  describe('readInline', () => {
    const base: t.IColumnTypeDef = {
      column: 'A',
      prop: 'foo',
      type: { kind: 'VALUE', typename: 'string' },
    };

    it('throws if not inline', () => {
      const type = { ...base, target: 'ref' };
      const fn = () => TypeTarget.readInline({ type, data: {} });
      expect(fn).to.throw();
    });

    it('cell.value', () => {
      const test = (cell: t.ICellData, expected: any) => {
        const type = { ...base };
        const res = TypeTarget.readInline({ type, data: cell });
        expect(res).to.eql(expected);
      };
      test({}, undefined);
      test({ value: 'hello' }, 'hello');
      test({ value: 123 }, 123);
      test({ value: undefined }, undefined);
      test({ value: null }, null);
      test({ value: { foo: 123 } }, { foo: 123 });
    });

    it('cell.props.[xxx]', () => {
      const test = (target: t.CellTypeTarget, cell: t.ICellData<any>, expected: any) => {
        const type = { ...base, target };
        const res = TypeTarget.readInline({ type, data: cell });
        expect(res).to.eql(expected);
      };
      test('inline:foo', { props: { foo: 123 } }, 123);
      test('inline:foo.bar', { props: { 'foo.bar': 'hello' } }, 'hello');
      test('inline:foo:bar', { props: { 'foo:bar': { color: 'red' } } }, { color: 'red' });
    });
  });
});
