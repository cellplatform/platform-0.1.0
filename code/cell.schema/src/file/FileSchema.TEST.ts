import { expect } from '../test';
import { FileSchema, FileLinks } from '.';
import { Schema } from '../Schema';

describe('FileSchema', () => {
  it('exposed from Schema (static)', () => {
    expect(Schema.file).to.equal(FileSchema);
    expect(Schema.file.links).to.equal(FileLinks);
  });

  it('uri', () => {
    const path = 'NS/foo/FILE/filename';
    expect(FileSchema.uri({ path })).to.eql('file:foo:filename');
  });

  it('uri (throws)', () => {
    const test = (path: string) => {
      const fn = () => FileSchema.uri({ path });
      expect(fn).to.throw();
    };
    test('/foo/filename');
    test('NS/foo/filename');
    test('BOO/foo/FILE/filename');
  });

  it('toFileLocation', () => {
    const test = (input: string | undefined, expected: string) => {
      const res = FileSchema.toFileLocation(input);
      expect(res).to.eql(expected);
    };

    // Empty.
    test(undefined, 'file://');
    test('', 'file://');
    test('  ', 'file://');

    // Path (trimmed).
    test('/foo', 'file:///foo');
    test('  /foo  ', 'file:///foo');

    // No change (http).
    test('http://foo', 'http://foo');
    test('https://foo', 'https://foo');
    test('  https://foo  ', 'https://foo');
  });
});
