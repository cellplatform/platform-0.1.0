import { expect, Hash, t } from '../../test';
import { ManifestHash } from '.';

describe('ManifestHash', () => {
  describe('files', () => {
    const testFile = (options: { text?: string; path?: string } = {}): t.ManifestFile => {
      const { path = 'dir/foo.txt', text = 'hello' } = options;
      const data = new TextEncoder().encode(text);
      const bytes = data.byteLength;
      const filehash = Hash.sha256(data);
      return { path, bytes, filehash };
    };

    const testFiles = (length: number) => {
      return Array.from({ length }).map((v, i) => {
        const path = `dir/file-${i + 1}.png`;
        const text = path;
        return testFile({ path, text });
      });
    };

    const expectHash = (value: string, expected: string) => {
      expect(value.endsWith(expected)).to.eql(true);
    };

    it('empty', () => {
      const EMPTY = Hash.sha256([]);
      const manifest: t.Manifest = { files: [], hash: { files: EMPTY } };
      expect(ManifestHash.fileshash([])).to.eql(EMPTY);
      expect(ManifestHash.fileshash(manifest)).to.eql(EMPTY);
    });

    it('single', () => {
      const file = testFile();
      expectHash(ManifestHash.fileshash([file]), '3f202283e3b9d0e5');
    });

    it('many (order independent)', async () => {
      const files = testFiles(3);

      const res1 = ManifestHash.fileshash(files);
      const res2 = ManifestHash.fileshash([files[2], files[1], files[0]]);
      const res3 = ManifestHash.fileshash([files[1], files[0], files[2]]);

      const HASH = 'c5c2e5f3dffc8eaab';
      expectHash(res1, HASH);
      expectHash(res2, HASH);
      expectHash(res3, HASH);
    });
  });
});
