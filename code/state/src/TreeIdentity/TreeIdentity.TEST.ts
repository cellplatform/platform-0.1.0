import { TreeIdentity } from '.';
import { expect } from '../test';

type S = string | undefined;
const Identity = TreeIdentity;

describe('TreeIdentity', () => {
  it('format( namespace, key )', () => {
    const test = (namespace: S, key: S, expected: string) => {
      const res = Identity.format(namespace, key);
      expect(res).to.eql(expected);
    };
    test('foo', 'bar', 'foo:bar');
    test('foo:zoo', 'bar', 'foo:zoo:bar');
    test('ns:foo:A1', 'node', 'ns:foo:A1:node');
    test('', 'bar', ':bar'); // Invalid.
    test('foo', '', 'foo:'); // Invalid.
  });

  it('hasNamespace', () => {
    const test = (input: S, expected: boolean) => {
      const res = Identity.hasNamespace(input);
      expect(res).to.eql(expected);
    };
    test('tree-foo:bar', true);
    test('  tree-foo:bar  ', true);
    test('ns:bar', true);
    test('ns:foo:A1', true);

    test(':bar', false);
    test('bar', false);
  });

  it('stripNamespace', () => {
    const test = (input: S, expected: string) => {
      const res = Identity.stripNamespace(input);
      expect(res).to.eql(expected);
    };
    test('tree-foo:bar', 'bar');
    test(' tree-foo:bar ', 'bar');
    test('bar', 'bar');
    test('', '');
    test('tree-foo:', '');
    test(' tree-foo: ', '');

    test('foo:bar', 'bar');
    test(':bar', 'bar');
    test(' :bar ', 'bar');

    test('ns:foo:A1:node', 'node');
  });

  it('parse', () => {
    const test = (input: S, namespace: string, key: string) => {
      const res = Identity.parse(input);
      const id = namespace ? `${namespace}:${key}` : key;
      expect(res).to.eql({ namespace, key, id });
    };
    test('foo:bar', 'foo', 'bar');
    test('  tree-foo:bar  ', 'tree-foo', 'bar');
    test('foo', '', 'foo');
    test('foo:bar', 'foo', 'bar');
    test('foo:bar:zoo', 'foo:bar', 'zoo');
    test('ns:foo:A1:node', 'ns:foo:A1', 'node');
    test('ns:foo:node', 'ns:foo', 'node');
    test('', '', '');
    test('  ', '', '');
  });

  it('namespace', () => {
    const test = (input: S, namespace: string) => {
      const res = Identity.namespace(input);
      expect(res).to.eql(namespace);
    };
    test('foo:bar', 'foo');
    test('ns:foo:A1:node', 'ns:foo:A1');
    test('tree-foo:bar', 'tree-foo');
    test('  foo:bar  ', 'foo');
    test('bar', '');
    test('  bar  ', '');
    test('', '');
    test(undefined, '');
  });

  it('key', () => {
    const test = (key: S, expected: string) => {
      expect(Identity.key(key)).to.eql(expected);
    };
    test('', '');
    test('  ', '');
    test('foo', 'foo');
    test('  foo  ', 'foo');
    test('tree-foo:bar', 'bar');
    test('ns:foo:A1:node', 'node');
  });

  it('cuid', () => {
    const cuid = Identity.cuid();
    expect(cuid.length).to.greaterThan(20);
  });

  it('slug', () => {
    const slug = Identity.slug();
    expect(slug.length).to.greaterThan(5);
    expect(slug.length).to.lessThan(10);
  });
});
