import { expect, Hash, t } from '../../test';
import { ManifestHash } from '.';

describe('ManifestHash', () => {
  const EMPTY = Hash.sha256([]);

  const testFile = (options: { path?: string; text?: string } = {}): t.ManifestFile => {
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
    expect(value.endsWith(expected)).to.eql(true, `value: ${value} | expected: ${expected}`);
  };

  it('sha256', () => {
    const data = new TextEncoder().encode('hello');
    expect(ManifestHash.sha256(data)).to.eql(Hash.sha256(data));
  });

  describe('files', () => {
    it('empty', () => {
      const manifest: t.Manifest = { files: [], hash: { files: EMPTY } };
      expect(ManifestHash.files([])).to.eql(EMPTY);
      expect(ManifestHash.files(manifest)).to.eql(EMPTY);
    });

    it('single', () => {
      const file = testFile();
      expectHash(ManifestHash.files([file]), '3f202283e3b9d0e5');
    });

    it('many (order agnostic)', () => {
      const files = testFiles(3);

      const res1 = ManifestHash.files(files);
      const res2 = ManifestHash.files([files[2], files[1], files[0]]);
      const res3 = ManifestHash.files([files[1], files[0], files[2]]);

      const HASH = 'c5c2e5f3dffc8eaab';
      expectHash(res1, HASH);
      expectHash(res2, HASH);
      expectHash(res3, HASH);
    });
  });

  describe('ModuleManifest', () => {
    const module: t.ModuleManifestInfo = {
      namespace: 'foo.bar',
      version: '1.2.3',
      compiler: `@platform/compiler@0.0.0`,
      compiledAt: 123456789,
      mode: 'production',
      target: 'web',
      entry: 'index.html',
      remote: {
        entry: 'remoteEntry.js',
        exports: [],
      },
    };

    it('empty', () => {
      const res = ManifestHash.module(module, []);
      expectHash(res.files, EMPTY);
      expectHash(res.module, '225a4bf897b1dcf7a91c6fc4');
    });

    it('files', () => {
      const files = testFiles(5);
      const res = ManifestHash.module(module, files);
      expectHash(res.files, ManifestHash.files(files));
      expectHash(res.module, '7fa30f0e145b9b5cade7d9b');
    });
  });

  describe('DirManifest', () => {
    const dir: t.DirManifestInfo = { indexedAt: 123456789 };

    it('empty', () => {
      const res = ManifestHash.dir(dir, []);
      expectHash(res.files, EMPTY);
      expectHash(res.dir, '0733adc460c49ae4f7f5ee');
    });

    it('files', () => {
      const files = testFiles(3);
      const res = ManifestHash.dir(dir, files);
      expectHash(res.files, ManifestHash.files(files));
      expectHash(res.dir, '5f711c806e5b214bd2720');
    });
  });
});
