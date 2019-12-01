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
    test('.foo', '\\foo');
    test('.foo.', '\\foo\\');
    test('foo.bar', 'foo\\bar');
    test('foo.bar.baz', 'foo\\bar\\baz');
  });

  it('toKey (encoded)', () => {
    const test = (input: string, output: string) => {
      const res = FileLinks.toKey(input);
      expect(res).to.eql(output);
    };
    test('foo', 'fs/foo');
    test('foo.png', 'fs/foo\\png');
    test('foo\\png', 'fs/foo\\png');
  });

  it('toKey: throw if contains "/"', () => {
    const fn = () => FileLinks.toKey('foo/bar.png');
    expect(fn).to.throw(/cannot contain "\/" character/);
  });

  it('toFilename (decoded)', () => {
    const test = (input: string, output: string) => {
      const res = FileLinks.toFilename(input);
      expect(res).to.eql(output);
    };
    test('fs/foo', 'foo');
    test('fs/foo\\png', 'foo.png');
  });
});
