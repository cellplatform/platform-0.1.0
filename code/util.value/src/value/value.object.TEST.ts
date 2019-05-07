import { expect } from 'chai';
import { value } from '.';

const { object } = value;

describe('object.build', () => {
  it('return default root object (no keyPath)', () => {
    expect(object.build('', {})).to.eql({});
    expect(object.build('  ', {})).to.eql({});
  });

  it('returns clone of the given root object', () => {
    const obj = {};
    expect(object.build('', obj)).to.not.equal(obj);
  });

  it('adds single level', () => {
    expect(object.build('foo', {})).to.eql({ foo: {} });
    expect(object.build(' foo  ', {})).to.eql({ foo: {} });
  });

  it('adds multi-levels (path)', () => {
    const res = object.build('foo.bar', {});
    expect(res).to.eql({ foo: { bar: {} } });
  });

  it('adds multi-levels with custom value', () => {
    const test = (value: any) => {
      const res = object.build<any>('foo.bar.baz', {}, value);
      expect(res.foo.bar.baz).to.eql(value);
    };
    test(0);
    test(123);
    test('hello');
    test('');
    test(' ');
    test({});
  });

  it('does not replace existing object/value (cloned, single-level)', () => {
    const obj = { foo: { bar: 123 } };
    const res = object.build<any>('foo', obj);
    expect(res).to.eql(obj);
    expect(res).to.not.equal(obj);
    expect(res.foo).to.not.equal(obj.foo);
  });

  it('throws if path overwrites value', () => {
    const test = (keyPath: string, obj: object) => {
      const fn = () => object.build(keyPath, obj);
      expect(fn).to.throw();
    };
    test('foo.bar', { foo: { bar: 123 } });
    test('foo.bar', { foo: { bar: 0 } });
    test('foo.bar', { foo: { bar: null } });
    test('foo.bar', { foo: { bar: '' } });
  });

  it('throws if starts/ends with period (.)', () => {
    const test = (keyPath: string) => {
      const fn = () => object.build(keyPath, {});
      expect(fn).to.throw();
    };
    test('foo.bar.');
    test('foo.bar. ');
    test('.foo.bar');
    test(' .foo.bar  ');
    test('.foo.bar.');
  });

  it('appends existing object', () => {
    const obj = { foo: { bar: 123 } };
    const res = object.build('foo.baz', obj);
    expect(res).to.eql({ foo: { bar: 123, baz: {} } });
  });
});

describe('object.pluck', () => {
  it('returns [undefined] when no match', () => {
    expect(object.pluck('foo', {})).to.eql(undefined);
    expect(object.pluck('foo.bar', {})).to.eql(undefined);
    expect(object.pluck('foo.bar', { baz: 123 })).to.eql(undefined);
  });

  it('gets value', () => {
    const test = (keyPath: string, root: any, value: any) => {
      const res = object.pluck(keyPath, root);
      expect(res).to.eql(value, `The key-path "${keyPath}" should be [${value}]`);
    };
    test('foo', { foo: 123 }, 123);
    test('foo.bar', { foo: { bar: 123 } }, 123);
    test(' foo.bar ', { foo: { bar: 123 } }, 123);
    test(' foo. bar ', { foo: { bar: 123 } }, 123);
  });

  it('throws if starts/ends with period (.)', () => {
    const test = (key: string) => {
      const fn = () => object.pluck(key, {});
      expect(fn).to.throw();
    };
    test('foo.bar.');
    test('foo.bar. ');
    test('.foo.bar');
    test(' .foo.bar  ');
    test('.foo.bar.');
  });
});

describe('object.remove', () => {
  const test = (keyPath: string, root: any, expected: any) => {
    const result = object.remove(keyPath, root);
    const msg = `keyPath: "${keyPath}"`;
    expect(result).to.eql(expected, msg);
    expect(result).to.not.equal(root, msg);
  };

  it('removes nothing (no match)', () => {
    test('', {}, {});
    test('', { foo: 123 }, { foo: 123 });
    test('foo', {}, {});
    test('foo', { bar: 456 }, { bar: 456 });
    test('foo.bar', {}, {});
    test('foo.bar', { foo: 123 }, { foo: 123 });
    test('foo.bar.baz', { foo: 123 }, { foo: 123 });
  });

  it('removes shallow path', () => {
    test('foo', { foo: 123 }, {});
    test('foo', { foo: 123, bar: 'hi' }, { bar: 'hi' });
  });

  it('removes deep path', () => {
    test('foo.bar', { foo: { bar: 123 } }, { foo: {} });
    test('foo.bar.baz', { foo: { bar: { baz: 456 } } }, { foo: { bar: {} } });
    test('foo.bar', { foo: { bar: 123, baz: 456 } }, { foo: { baz: 456 } });
    test('foo.bar', { foo: { bar: 123 }, baz: 456 }, { baz: 456, foo: {} });
  });

  it('removes wildcard (*)', () => {
    test('foo.*', { foo: { bar: 123 } }, { foo: {} });
    test('foo.*', { foo: { bar: 123 }, baz: 456 }, { baz: 456, foo: {} });
    test('*', { foo: { bar: 123 }, baz: 456 }, {});
  });
});

describe('object.prune', () => {
  const test = (keyPath: string, root: any, expected: any) => {
    const result = object.prune(keyPath, root);
    const msg = `keyPath: "${keyPath}"`;
    expect(result).to.eql(expected, msg);
    expect(result).to.not.equal(root, msg);
  };

  it('prunes nothing (no match)', () => {
    test('', {}, {});
    test('', { foo: 123 }, { foo: 123 });
    test('foo', {}, {});
    test('foo', { bar: 456 }, { bar: 456 });
    test('foo.bar', {}, {});
    test('foo.bar', { foo: 123 }, { foo: 123 });
    test('foo.bar.baz', { foo: 123 }, { foo: 123 });
  });

  it('prunes nothing (child not empty)', () => {
    test('foo', { foo: { bar: {} } }, { foo: { bar: {} } });
  });

  it('throws if wild card not at end of path', () => {
    const fn = () => object.prune('*.bar', {});
    expect(fn).to.throw();
  });

  it('prunes wildcard (*)', () => {
    test('foo.*', { foo: { bar: {}, baz: 123 } }, {});
    test('foo.*', { foo: 123 }, {});
    test('foo.*', {}, {});
    test('*', {}, {});
    test('*', { foo: 123, bar: {} }, {});
  });

  it('prunes shallow path', () => {
    test('foo', { foo: 123 }, {});
    test('foo', { foo: 123, bar: 'hi' }, { bar: 'hi' });
  });

  it('prunes deep path', () => {
    test('foo.bar', { foo: { bar: 123 } }, {});
    test('foo.bar.baz', { foo: { bar: { baz: 456 } } }, {});
    test('foo.bar', { foo: { bar: 123, baz: 456 } }, { foo: { baz: 456 } });
    test('foo.bar', { foo: { bar: 123 }, baz: 456 }, { baz: 456 });
  });
});

describe('object.toArray', () => {
  type IFoo = { count: number };
  type IFoos = {
    one: IFoo;
    two: IFoo;
  };
  const foos: IFoos = { one: { count: 1 }, two: { count: 2 } };

  it('empty', () => {
    expect(object.toArray({})).to.eql([]);
  });

  it('converts to array (untyped)', () => {
    const res = object.toArray(foos);
    expect(res.length).to.eql(2);
  });

  it('converts to array (typed object)', () => {
    const res = object.toArray<IFoos>(foos);
    expect(res.length).to.eql(2);

    expect(res[0].key).to.eql('one');
    expect(res[1].key).to.eql('two');

    expect(res[0].value).to.eql({ count: 1 });
    expect(res[1].value).to.eql({ count: 2 });
  });

  it('converts to array (typed key)', () => {
    type K = 'foo' | 'bar';
    const res = object.toArray<IFoos, K>(foos);
    expect(res.length).to.eql(2);
  });
});
