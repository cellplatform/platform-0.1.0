import { ManifestSource } from '.';
import { expect } from '../../test';

describe.only('ManifestSource', () => {
  it('kind: filepath', () => {
    const path = '/foo/bar/index.json';
    const source = ManifestSource(`  ${path}  `); // NB: trimmed.
    expect(source.kind).to.eql('filepath');
    expect(source.domain).to.eql('local:package');
    expect(source.dir).to.eql('/foo/bar');
    expect(source.path).to.eql(path);
    expect(source.toString()).to.eql(path);
  });

  it('kind: url', () => {
    const path = 'https://domain.com:1234/cell:foo:A1/fs/foo/bar/index.json';
    const source = ManifestSource(`  ${path}  `); // NB: trimmed.
    expect(source.kind).to.eql('url');
    expect(source.path).to.eql(path);
    expect(source.domain).to.eql('domain.com:1234');
    expect(source.dir).to.eql('/foo/bar');
    expect(source.toString()).to.eql(path);
  });

  it('throw (create/validate errors)', () => {
    const test = (input: any) => {
      const fn = () => ManifestSource(input);
      expect(fn).to.throw();
    };

    test('');
    test('  ');
    test(undefined);
    test(null);
    test({});
    test([]);
    test(123);
    test(true);

    // Not an ".json" file.
    test('/foo/bar');
    test('/foo/bar.js');
    test('foo/bar/index.json'); // Directory paths must be absolute.

    test('https://domain.com/ns:abc/fs/foo/index.json'); // Not a valid cell URI.
    test('https://domain.com/cell:abc:A1/foo/index.json'); // Not a "/fs/..." cell filesystem path.
  });
});
