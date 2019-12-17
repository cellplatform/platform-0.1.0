import { expect, t } from '../test';
import { FileLinks } from '.';

describe('FileLinks', () => {
  it('encodeKey => decodeKey', () => {
    const test = (input: string, output: string) => {
      const res = {
        encoded: FileLinks.encodeKey(input),
        decoded: FileLinks.decodeKey(FileLinks.encodeKey(input)),
      };
      expect(res.encoded).to.eql(output);
      expect(res.decoded).to.eql(input);
    };

    test('foo', 'foo');
    test('.foo', ':foo');
    test('.foo.', ':foo:');
    test('...foo.', ':::foo:');
    test('foo.png', 'foo:png');
    test('foo.bar.baz', 'foo:bar:baz');
  });

  it('toKey (encoded)', () => {
    const test = (input: string, output: string) => {
      const res = FileLinks.toKey(input);
      expect(res).to.eql(output);
    };
    test('foo', 'fs:foo');
    test('foo.png', 'fs:foo:png');
    test('fs.foo.png', 'fs:fs:foo:png');
  });

  it('toFilename (decoded)', () => {
    const test = (input: string, output: string) => {
      const res = FileLinks.toFilename(input);
      expect(res).to.eql(output);
    };
    test('fs:foo', 'foo');
    test('fs:foo:png', 'foo.png');
    test('fs:fs:foo:png', 'fs.foo.png');
  });

  it('parseLink', () => {
    const test = (input: string, expectedUri: string, expectedHash: string | undefined) => {
      const res = FileLinks.parseLink(input);
      expect(res.uri).to.eql(expectedUri);
      expect(res.hash).to.eql(expectedHash);
    };
    test('file:foo:123', 'file:foo:123', '');
    test('file:foo:123?hash=abc', 'file:foo:123', 'abc');
    test('  file:foo:123?hash=abc  ', 'file:foo:123', 'abc');
    test('file:foo:123?bam=boo', 'file:foo:123', '');
    test('file:foo:123?bam=boo&hash=abc ', 'file:foo:123', 'abc');
  });

  describe('error', () => {
    it('toKey: throw if contains "/"', () => {
      const fn = () => FileLinks.toKey('foo/bar.png');
      expect(fn).to.throw(/cannot contain "\/" character/);
    });

    it('toKey: throw if contains ":"', () => {
      const fn = () => FileLinks.toKey('foo:bar.png');
      expect(fn).to.throw(/cannot contain ":" character/);
    });
  });
});
