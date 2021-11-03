import { expect, Hash, t } from '../../test';
import { ManifestFiles } from '.';
import { ManifestHash } from '../ManifestHash';
import { naturalCompare } from './compare';

describe('ManifestFiles', () => {
  const testFile = (path: string, text?: string): t.ManifestFile => {
    const data = new TextEncoder().encode(text ?? 'hello');
    const bytes = data.byteLength;
    const filehash = Hash.sha256(data);
    return { path, bytes, filehash };
  };

  describe('hash', () => {
    it('[array]', () => {
      const file1 = testFile('foo.txt');
      const file2 = testFile('foo/bar.png');

      const HASH = ManifestHash.files([file1, file2]);

      expect(ManifestFiles.hash([file1, file2])).to.eql(HASH);
      expect(ManifestFiles.hash([file2, file1])).to.eql(HASH); // NB: order agnostic.
    });

    it('{manifest}', () => {
      const file1 = testFile('foo.txt');
      const file2 = testFile('foo/bar.png');
      const files = [file1, file2];
      const HASH = ManifestHash.files(files);

      const manifest: t.Manifest = { hash: {} as any, files };
      expect(ManifestFiles.hash(manifest)).to.eql(HASH);
    });
  });

  describe('sort', () => {
    it('compare', () => {
      expect(ManifestFiles.compare).to.equal(naturalCompare);
    });

    it('sort', () => {
      type F = t.ManifestFile;
      const unsorted = ['z1.doc', 'z10.doc', 'z17.doc', 'z2.doc', 'z23.doc', 'z3.doc'];
      const sorted = ['z1.doc', 'z2.doc', 'z3.doc', 'z10.doc', 'z17.doc', 'z23.doc'];

      const files1: F[] = unsorted.map((path) => ({ path, bytes: 123, filehash: 'sha256-abc' }));
      const files2 = ManifestFiles.sort(files1);

      expect(files2).to.not.equal(files1); // NB: Immutable copy.
      expect(files2.map((file) => file.path)).to.eql(sorted);
    });
  });
});
