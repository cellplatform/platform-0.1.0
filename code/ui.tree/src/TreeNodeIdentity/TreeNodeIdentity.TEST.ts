import { TreeNodeIdentity } from '.';
import { expect } from '../test';

type S = string | undefined;
const Id = TreeNodeIdentity;

describe('TreeNodeId', () => {
  it('format( namespace, id )', () => {
    const test = (namespace: S, id: S, expected: string) => {
      const res = Id.format(namespace, id);
      expect(res).to.eql(expected);
    };
    test('foo', 'bar', 'foo:bar');
    test('', 'bar', ':bar'); // Invalid.
    test('foo', '', 'foo:'); // Invalid.
  });

  it('hasNamespace', () => {
    const test = (input: S, expected: boolean) => {
      const res = Id.hasNamespace(input);
      expect(res).to.eql(expected);
    };
    test('tree-foo:bar', true);
    test('  tree-foo:bar  ', true);
    test('ns:bar', true);

    test(':bar', false);
    test('bar', false);
  });

  it('stripNamespace', () => {
    const test = (input: S, expected: string) => {
      const res = Id.stripNamespace(input);
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
  });

  it('parse', () => {
    const test = (input: S, namespace: string, id: string) => {
      const res = Id.parse(input);
      expect(res).to.eql({ namespace, id });
    };
    test('foo:bar', 'foo', 'bar');
    test('  tree-foo:bar  ', 'tree-foo', 'bar');
    test('foo', '', 'foo');
    test('foo:bar', 'foo', 'bar');
    test('foo:bar:zoo', 'foo', 'bar:zoo');
    test('', '', '');
    test('  ', '', '');
  });

  it('namespace', () => {
    const test = (input: S, namespace: string) => {
      const res = Id.namespace(input);
      expect(res).to.eql(namespace);
    };
    test('foo:bar', 'foo');
    test('tree-foo:bar', 'tree-foo');
    test('  foo:bar  ', 'foo');
    test('bar', '');
    test('  bar  ', '');
    test('', '');
    test(undefined, '');
  });

  it('id', () => {
    const test = (id: S, expected: string) => {
      expect(Id.id(id)).to.eql(expected);
    };
    test('', '');
    test('  ', '');
    test('foo', 'foo');
    test('  foo  ', 'foo');
    test('tree-foo:bar', 'bar');
  });
});
