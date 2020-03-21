import { RefLinks } from '.';
import { expect, t } from '../test';
import { Uri } from '../Uri';

describe.only('RefLinks', () => {
  it('prefix', () => {
    expect(RefLinks.prefix).to.eql('ref');
  });

  describe('is', () => {
    it('refKey', () => {
      const test = (input: string | undefined, expected: boolean) => {
        const res = RefLinks.is.refKey(input);
        expect(res).to.eql(expected);
      };

      test(undefined, false);
      test('', false);
      test('  ', false);
      test('fs:func:wasm', false);

      test('  ref:ns:foo  ', true);
      test('ref:cell:foo!A1', true);
    });

    it('refValue', () => {
      const test = (input: string | undefined, expected: boolean) => {
        const res = RefLinks.is.refValue(input);
        expect(res).to.eql(expected);
      };

      test(undefined, false);
      test('', false);
      test('  ', false);
      test('fs:func:wasm', false);
      test('file:foo:abc', false);

      test('ns:foo', true);
      test('  ns:foo  ', true);
      test('cell:foo!A1', true);
      test('cell:foo!A', true);
      test('cell:foo!1', true);

      test('cell:foo!A1?hash=abc', true);
      test('cell:foo!A?hash=abc', true);
      test('cell:foo!1?hash=abc', true);
    });
  });

  it('total', () => {
    const test = (links: t.IUriMap | undefined, expected: number) => {
      const res = RefLinks.total(links);
      expect(res).to.eql(expected);
    };
    test(undefined, 0);
    test({}, 0);
    test({ foo: 'bar' }, 0);

    test({ ref: '...' }, 1);
    test({ foo: 'bar', 'ref:foo': '...' }, 1);
    test(
      {
        foo: 'bar',
        ref: '...',
        'ref:foo': '...',
      },
      2,
    );
  });

  it('toKey', () => {
    const test = (linkName: string, expected: string) => {
      const res = RefLinks.toKey(linkName);
      expect(res).to.eql(expected);
    };
    test('foo', 'ref:foo');
    test('foo/bar', 'ref:foo::bar');
    test('foo.bar', 'ref:foo:bar');
  });

  it('parseKey', () => {
    const key = RefLinks.toKey('foo/bar.t');
    const res = RefLinks.parseKey(key);

    expect(res.key).to.eql('ref:foo::bar:t');
    expect(res.path).to.eql('foo/bar.t');
    expect(res.name).to.eql('bar.t');
    expect(res.dir).to.eql('foo');
    expect(res.ext).to.eql('t');
  });

  it('toValue', () => {
    const uri = Uri.parse('cell:foo:A1').parts;
    const res1 = RefLinks.toValue(uri);
    expect(res1).to.eql('cell:foo:A1');

    const res2 = RefLinks.toValue(uri, { hash: 'abc' });
    expect(res2).to.eql('cell:foo:A1?hash=abc');
  });

  describe('parseLink', () => {
    it('throw: file URI not provided', () => {
      const fn = () => RefLinks.parseLink('file:foo:123');
      expect(fn).to.throw();
    });

    it('uri', () => {
      const test = (input: string, expected: string) => {
        const res = RefLinks.parseLink(input);
        expect(res.uri.toString()).to.eql(expected);
      };
      test('cell:foo:A1', 'cell:foo:A1');
      test('cell:foo:A1?hash=abc', 'cell:foo:A1');
      test('  cell:foo:A1?hash=abc  ', 'cell:foo:A1');
      test('cell:foo:A1?hash=abc&foo=123', 'cell:foo:A1');
    });

    it('hash', () => {
      const test = (input: string, expected?: string) => {
        const res = RefLinks.parseLink(input);
        expect(res.hash).to.eql(expected);
      };
      test('cell:foo:A1', undefined);
      test('cell:foo:A1?hash=abc', 'abc');
      test('  cell:foo:A1?hash=abc  ', 'abc');
      test('cell:foo:A1?bam=boo', undefined);
      test('cell:foo:A1?bam=boo&hash=abc ', 'abc');
    });

    it('toString', () => {
      const test = (input: string, expected: string) => {
        const res = RefLinks.parseLink(input);
        expect(res.toString()).to.eql(expected);
      };
      test('cell:foo:A1', 'cell:foo:A1');
      test('  cell:foo:A1  ', 'cell:foo:A1');
      test('cell:foo:A1?', 'cell:foo:A1');
      test('  cell:foo:A1?hash=abc  ', 'cell:foo:A1?hash=abc');
    });

    it('toString: modify query-string values', () => {
      const test = (args: { hash?: string | null }, expected: string) => {
        expect(RefLinks.parseLink('cell:foo:A1').toString(args)).to.eql(expected);
        expect(RefLinks.parseLink('  cell:foo:A1  ').toString(args)).to.eql(expected);
      };
      test({}, 'cell:foo:A1');
      test({ hash: 'abc' }, 'cell:foo:A1?hash=abc');
    });

    it('toString: remove query-string values', () => {
      const test = (args: { hash?: string | null }, expected: string) => {
        const res = RefLinks.parseLink('cell:foo:A1?hash=abc').toString(args);
        expect(res).to.eql(expected);
      };
      test({}, 'cell:foo:A1?hash=abc'); // NB: No change.
      test({ hash: null }, 'cell:foo:A1');
    });
  });
});
