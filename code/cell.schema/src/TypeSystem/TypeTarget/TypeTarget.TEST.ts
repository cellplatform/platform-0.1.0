import { expect, t } from '../test';
import { TypeTarget } from '.';

describe.only('TypeTarget', () => {
  it('invalid', () => {
    const test = (input: any) => {
      const info = TypeTarget.parse(input);
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
      const info = TypeTarget.parse(input);
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
    const info = TypeTarget.parse('ref');
    expect(info.target).to.eql('ref');
    expect(info.kind).to.eql('ref');
    expect(info.isValid).to.eql(true);
    expect(info.isRef).to.eql(true);
    expect(info.isInline).to.eql(false);
    expect(info.errors).to.eql([]);
  });

  it('path: inline (value)', () => {
    const test = (input: string) => {
      const info = TypeTarget.parse(input);
      expect(info.path).to.eql('value');
    };
    test('inline');
    test('  inline  ');
    test('');
    test('   ');
  });

  it('path: inline (props)', () => {
    const test = (input: string, path: string) => {
      const info = TypeTarget.parse(input);
      expect(info.path).to.eql(path);
    };
    test('inline:foo', 'props:foo');
    test('inline:foo.bar', 'props:foo.bar');
  });

  it('path: ref', () => {
    const test = (input: string, path: string) => {
      const info = TypeTarget.parse(input);
      expect(info.path).to.eql(path);
    };
    test('ref', 'ref:type');
  });

  describe('read (inline)', () => {
    const base: t.IColumnTypeDef = {
      column: 'A',
      prop: 'foo',
      type: { kind: 'VALUE', typename: 'string' },
    };

    it('throws if not inline', () => {
      const type = { ...base, target: 'ref' };
      const fn = () => TypeTarget.read(type).inline({});
      expect(fn).to.throw();
    });

    it('read: cell.value', () => {
      const test = (cell: t.ICellData, expected: any) => {
        const type = { ...base, target: undefined };
        const res = TypeTarget.read(type).inline(cell);
        expect(res).to.eql(expected);
      };
      test({}, undefined);
      test({ value: 'hello' }, 'hello');
      test({ value: 123 }, 123);
      test({ value: undefined }, undefined);
      test({ value: null }, null);
      test({ value: { foo: 123 } }, { foo: 123 });
    });

    it('read: cell.props.[xxx]', () => {
      const test = (target: t.CellTypeTarget, cell: t.ICellData<any>, expected: any) => {
        const type = { ...base, target };
        const res = TypeTarget.read(type).inline(cell);
        expect(res).to.eql(expected);
      };
      test('inline:foo', { props: { foo: 123 } }, 123);
      test('inline:foo.bar', { props: { 'foo.bar': 'hello' } }, 'hello');
      test('inline:foo:bar', { props: { 'foo:bar': { color: 'red' } } }, { color: 'red' });
      test('inline:foo:bar.baz', { props: { 'foo:bar.baz': 'jam' } }, 'jam');
    });
  });

  describe('write (inline)', () => {
    const base: t.IColumnTypeDef = {
      column: 'A',
      prop: 'foo',
      type: { kind: 'VALUE', typename: 'string' },
    };

    it('throws if not inline', () => {
      const type = { ...base, target: 'ref' };
      const fn = () => TypeTarget.write(type).inline({ data: 123 });
      expect(fn).to.throw();
    });

    it('write: cell.value', () => {
      const type = { ...base, target: 'inline' };

      const cell: t.ICellData<any> = { value: 'foo', props: { style: { bold: true } } };
      const res1 = TypeTarget.write(type).inline({ cell, data: 123 });
      expect(res1).to.eql({ value: 123, props: { style: { bold: true } } });
      expect(res1).to.not.equal(cell); // NB: different instance.

      const res2 = TypeTarget.write(type).inline({ data: 'hello' });
      expect(res2).to.eql({ value: 'hello' }); // NB: generated cell object.

      const res3 = TypeTarget.write(type).inline({
        data: 'hello',
        cell: { value: 'foo', props: { style: {} } },
      });
      expect(res3).to.eql({ value: 'hello' }); // NB: props squashed.

      const res4 = TypeTarget.write(type).inline({ data: '', cell: { value: 'foo' } });
      expect(res4).to.eql({ value: '' });

      const res5 = TypeTarget.write(type).inline({ data: undefined, cell: { value: 'foo' } });
      expect(res5).to.eql({}); // NB: value field deleted.

      const res6 = TypeTarget.write(type).inline({ data: null, cell: { value: 'foo' } });
      expect(res6).to.eql({}); // NB: value field deleted.
    });

    it('write: cell.props.[xxx]', () => {
      const test = (
        target: t.CellTypeTarget,
        cell: t.ICellData<any> | undefined,
        data: any,
        expected: any,
      ) => {
        const type = { ...base, target };
        const res = TypeTarget.write(type).inline({ cell, data });
        expect(res).to.eql(expected);
      };

      test('inline:foo', undefined, undefined, {});
      test('inline:foo', undefined, 123, { props: { foo: 123 } });
      test('inline:foo.bar', undefined, 123, { props: { 'foo.bar': 123 } });
      test('inline:foo:bar', undefined, 123, { props: { 'foo:bar': 123 } });
      test('inline:foo:bar.baz', undefined, 123, { props: { 'foo:bar.baz': 123 } });

      test('inline:foo', { value: 'abc' }, 123, { value: 'abc', props: { foo: 123 } });
      test('inline:foo', {}, { msg: 5 }, { props: { foo: { msg: 5 } } });
      test('inline:foo', { props: { foo: { x: 1 } } }, { x: 2 }, { props: { foo: { x: 2 } } });

      test('inline:x', { props: { x: 1, y: 2 } }, 99, { props: { x: 99, y: 2 } });
      test('inline:x', { props: { x: 1, y: 2 } }, undefined, { props: { y: 2 } }); // NB: deleted.
      test('inline:x', { props: { x: 1 } }, undefined, {}); // NB: deleted, collapses props.
    });
  });
});
