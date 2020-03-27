import { expect, t } from '../../test';
import { TypeTarget } from '.';

describe('TypeTarget', () => {
  describe('parse', () => {
    it('toString', () => {
      const test = (input: any) => {
        const info = TypeTarget.parse(input);
        expect(info.toString()).to.eql(info.target);
      };
      test(undefined);
      test('');
      test('inline');
      test('ref');
    });

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
        expect(info.path).to.eql('value');
      };
      test(undefined); // NB: Default "inline" target.
      test(''); //        NB: Default "inline" target.
      test('inline');
      test('  inline  ');
    });

    it('kind: inline (props path)', () => {
      const test = (input: string, path: string) => {
        const info = TypeTarget.parse(input);
        expect(info.path).to.eql(path);
      };
      test('inline:foo', 'props:foo');
      test('inline:foo.bar', 'props:foo.bar');
      test('inline:foo:bar.baz', 'props:foo:bar.baz');
    });

    it('kind: ref', () => {
      const info = TypeTarget.parse('ref');
      expect(info.target).to.eql('ref');
      expect(info.kind).to.eql('ref');
      expect(info.isValid).to.eql(true);
      expect(info.isRef).to.eql(true);
      expect(info.isInline).to.eql(false);
      expect(info.errors).to.eql([]);
      expect(info.path).to.eql('');
    });
  });

  describe('inline: read', () => {
    const base: t.IColumnTypeDef = {
      column: 'A',
      prop: 'foo',
      type: { kind: 'VALUE', typename: 'string' },
    };

    it('throws if not inline', () => {
      const type = { ...base, target: 'ref' };
      const fn = () => TypeTarget.inline(type).read({});
      expect(fn).to.throw();
    });

    it('read: cell.value', () => {
      const test = (cell: t.ICellData, expected: any) => {
        const type = { ...base, target: undefined };
        const res = TypeTarget.inline(type).read(cell);
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
        const res = TypeTarget.inline(type).read(cell);
        expect(res).to.eql(expected);
      };
      test('inline:foo', { props: { foo: 123 } }, 123);
      test('inline:foo.bar', { props: { 'foo.bar': 'hello' } }, 'hello');
      test('inline:foo:bar', { props: { 'foo:bar': { color: 'red' } } }, { color: 'red' });
      test('inline:foo:bar.baz', { props: { 'foo:bar.baz': 'jam' } }, 'jam');
    });
  });

  describe('inline: write', () => {
    const base: t.IColumnTypeDef = {
      column: 'A',
      prop: 'foo',
      type: { kind: 'VALUE', typename: 'string' },
    };

    it('throws if not inline', () => {
      const type = { ...base, target: 'ref' };
      const fn = () => TypeTarget.inline(type).write({ data: 123 });
      expect(fn).to.throw();
    });

    it('write: cell.value', () => {
      const type = { ...base, target: 'inline' };

      const cell: t.ICellData<any> = { value: 'foo', props: { style: { bold: true } } };
      const res1 = TypeTarget.inline(type).write({ cell, data: 123 });
      expect(res1).to.eql({ value: 123, props: { style: { bold: true } } });
      expect(res1).to.not.equal(cell); // NB: different instance.

      const res2 = TypeTarget.inline(type).write({ data: 'hello' });
      expect(res2).to.eql({ value: 'hello' }); // NB: generated cell object.

      const res3 = TypeTarget.inline(type).write({
        data: 'hello',
        cell: { value: 'foo', props: { style: {} } },
      });
      expect(res3).to.eql({ value: 'hello' }); // NB: props squashed.

      const res4 = TypeTarget.inline(type).write({ data: '', cell: { value: 'foo' } });
      expect(res4).to.eql({ value: '' });

      const res5 = TypeTarget.inline(type).write({ data: undefined, cell: { value: 'foo' } });
      expect(res5).to.eql({}); // NB: value field deleted.

      const res6 = TypeTarget.inline(type).write({ data: null, cell: { value: 'foo' } });
      expect(res6).to.eql({ value: null }); // NB: value field NOT deleted.
    });

    it('write: cell.props.[xxx]', () => {
      const test = (
        target: t.CellTypeTarget,
        cell: t.ICellData<any> | undefined,
        data: any,
        expected: any,
      ) => {
        const type = { ...base, target };
        const res = TypeTarget.inline(type).write({ cell, data });
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

      test('inline:x', { props: { x: 123 } }, null, { props: { x: null } });
    });
  });

  describe('ref: write', () => {
    const refType: t.ITypeRef = {
      kind: 'REF',
      typename: 'color',
      scope: 'NS',
      uri: 'ns:foo',
      types: [
        { prop: 'name', type: { kind: 'VALUE', typename: 'string' } },
        { prop: 'color', type: { kind: 'VALUE', typename: 'string' } },
      ],
    };

    const defComplex: t.IColumnTypeDef<t.ITypeRef> = {
      column: 'A',
      prop: 'foo',
      type: refType,
      target: 'ref',
    };

    it('throw: type not "REF"', () => {
      const defSimple: t.IColumnTypeDef = {
        column: 'A',
        prop: 'foo',
        type: { kind: 'VALUE', typename: 'string' },
        target: 'ref',
      };
      const fn = () => TypeTarget.ref(defSimple as any);
      expect(fn).to.throw(/The given type is not of kind REF \(given "VALUE"\)/);
    });

    it('throw: type-def target not "ref"', () => {
      const test = (target: string | undefined) => {
        const def: t.IColumnTypeDef<t.ITypeRef> = {
          ...defComplex,
          target,
        };
        const fn = () => TypeTarget.ref(def);
        expect(fn).to.throw(/The given target is not "ref"/);
      };
      test(undefined);
      test('');
      test('inline');
      test('inline:foo.bar');
      test('RANDOM');
    });

    it('throw: type-def scope is not NS (ie complex-object)', () => {
      const def: t.IColumnTypeDef<t.ITypeRef> = {
        ...defComplex,
        type: { ...refType, scope: 'COLUMN' },
      };
      const fn = () => TypeTarget.ref(def);
      expect(fn).to.throw(/does not reference a NS \(given scope "COLUMN"\)/);
    });

    it('throw: target URI link is not a ROW', () => {
      const test = (uri: string) => {
        const fn = () => TypeTarget.ref(defComplex).write({ uri });
        expect(fn).to.throw(/reference\/link URI is not a ROW/);
      };
      test('cell:foo:A1');
      test('cell:foo:A');
      test('cell:foo');
      test('ns:foo');
      test('file:foo:123');
      test('foo:FAIL');
    });

    it('read', () => {
      const res1 = TypeTarget.ref(defComplex).read({});
      const res2 = TypeTarget.ref(defComplex).read({
        cell: { links: { 'ref:type': 'cell:foo:10', 'fs:foo': 'file:foo:abc' } },
      });
      const res3 = TypeTarget.ref(defComplex).read({
        cell: { links: { 'ref:type': 'cell:foo:5?hash=abc' } },
      });

      expect(res1).to.eql(undefined);

      expect(res2?.uri.toString()).to.eql('cell:foo:10');
      expect(res2?.hash).to.eql(undefined);

      expect(res3?.uri.toString()).to.eql('cell:foo:5');
      expect(res3?.hash).to.eql('abc');
    });

    it('write: link', () => {
      const uri = 'cell:foo:1';
      const res1 = TypeTarget.ref(defComplex).write({ uri });
      const res2 = TypeTarget.ref(defComplex).write({
        uri,
        cell: { links: { 'ref:type': 'cell:foo:9', 'fs:foo': 'file:foo:abc' } },
      });
      const res3 = TypeTarget.ref(defComplex).write({ uri, hash: 'abc' });

      expect((res1.links || {})['ref:type']).to.eql('cell:foo:1');

      expect((res2.links || {})['ref:type']).to.eql('cell:foo:1');
      expect((res2.links || {})['fs:foo']).to.eql('file:foo:abc');

      expect((res3.links || {})['ref:type']).to.eql('cell:foo:1?hash=abc');
    });

    it('clear: link', () => {
      const res1 = TypeTarget.ref(defComplex).remove();
      const res2 = TypeTarget.ref(defComplex).remove({
        cell: {
          value: 123,
          links: { 'ref:type': 'cell:foo:9', 'fs:foo': 'file:foo:abc' },
        },
      });

      expect(res1).to.eql({});
      expect(res2).to.eql({ value: 123, links: { 'fs:foo': 'file:foo:abc' } });
    });
  });
});
