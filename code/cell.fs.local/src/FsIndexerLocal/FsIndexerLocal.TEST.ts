import { FsIndexerLocal } from '.';
import { expect, Hash, TestUtil, time } from '../test';

describe('FsIndexer', () => {
  beforeEach(() => TestUtil.reset());

  const nodefs = TestUtil.node;
  const dir = TestUtil.PATH.LOCAL;

  const copy = async (source: string, target?: string) => {
    const from = nodefs.join(nodefs.resolve('static.test'), source);
    const to = nodefs.join(dir, target ?? source);
    const data = await nodefs.readFile(from);
    await nodefs.ensureDir(nodefs.dirname(to));
    await nodefs.writeFile(to, data);
    return to;
  };

  it('dir', () => {
    const dir = TestUtil.PATH.LOCAL;
    const indexer = FsIndexerLocal({ fs: nodefs, dir });
    expect(indexer.dir).to.eql(dir);
  });

  describe('manifest', () => {
    it('empty', async () => {
      const indexer = FsIndexerLocal({ fs: nodefs, dir });
      const now = time.now.timestamp;
      const manifest = await indexer.manifest();

      expect(manifest.kind).to.eql('dir');
      expect(manifest.dir.indexedAt).to.within(now - 10, now + 20);
      expect(manifest.files.length).to.eql(0);
    });

    it('files (deep)', async () => {
      await copy('file.txt');
      await copy('images/bird.png');
      await copy('images/award.svg', 'images/foo/bar/icon.svg');

      const now = time.now.timestamp;
      const indexer = FsIndexerLocal({ fs: nodefs, dir });
      const manifest = await indexer.manifest();

      expect(manifest.kind).to.eql('dir');
      expect(manifest.dir.indexedAt).to.within(now - 10, now + 20);
      expect(manifest.files.length).to.eql(3);
    });

    it('hash comparison (SHA256)', async () => {
      const path1 = await copy('file.txt');
      const path2 = await copy('images/bird.png');

      const indexer = FsIndexerLocal({ fs: nodefs, dir });
      const manifest = await indexer.manifest();

      const src1 = Uint8Array.from(await nodefs.readFile(path1));
      const src2 = Uint8Array.from(await nodefs.readFile(path2));

      const find = (path: string) => manifest.files.find((file) => file.path === path);
      const file1 = find('file.txt');
      const file2 = find('images/bird.png');

      expect(file1?.filehash).to.eql(Hash.sha256(src1));
      expect(file2?.filehash).to.eql(Hash.sha256(src2));
    });

    it('filter', async () => {
      await copy('file.txt');
      await copy('images/bird.png');
      await copy('images/award.svg', 'foo/icon-1.svg');
      await copy('images/award.svg', 'foo/bar/icon-2.svg');

      const indexer = FsIndexerLocal({ fs: nodefs, dir });
      const manifest1 = await indexer.manifest({ filter: (e) => !e.path.endsWith('.svg') });
      const manifest2 = await indexer.manifest({ filter: (e) => !e.path.endsWith('.png') });

      const files1 = manifest1.files.map((file) => file.path);
      const files2 = manifest2.files.map((file) => file.path);

      expect(files1).to.eql(['file.txt', 'images/bird.png']);
      expect(files2).to.eql(['file.txt', 'foo/bar/icon-2.svg', 'foo/icon-1.svg']);
    });

    it('sub-dir', async () => {
      await copy('file.txt');
      await copy('images/bird.png');
      await copy('images/award.svg', 'foo/icon-1.svg');
      await copy('images/award.svg', 'foo/bar/icon-2.svg');

      const indexer = FsIndexerLocal({ fs: nodefs, dir });
      const manifest1 = await indexer.manifest({ dir: 'foo' });
      const manifest2 = await indexer.manifest({ dir: nodefs.join(dir, 'foo') });

      const files1 = manifest1.files.map((file) => file.path);
      const files2 = manifest2.files.map((file) => file.path);

      expect(files1).to.eql(files2);
      expect(files1).to.eql(['foo/bar/icon-2.svg', 'foo/icon-1.svg']);
    });

    it('sub-dir: root', async () => {
      await copy('file.txt');
      await copy('images/bird.png');

      const indexer = FsIndexerLocal({ fs: nodefs, dir });
      const manifest = await indexer.manifest({ dir });

      const files = manifest.files.map((file) => file.path);
      expect(files).to.eql(['file.txt', 'images/bird.png']);
    });

    it('sub-dir: "" (empty) - assumes root', async () => {
      await copy('file.txt');
      await copy('images/bird.png');

      const indexer = FsIndexerLocal({ fs: nodefs, dir });
      const manifest1 = await indexer.manifest({ dir: '' });
      const manifest2 = await indexer.manifest({ dir: '  ' });

      const files1 = manifest1.files.map((file) => file.path);
      const files2 = manifest2.files.map((file) => file.path);

      expect(files1).to.eql(files2);
      expect(files1).to.eql(['file.txt', 'images/bird.png']);
    });

    it('dir (does not exist) - returns no files', async () => {
      await copy('file.txt');
      await copy('images/bird.png');

      const indexer = FsIndexerLocal({ fs: nodefs, dir });
      const manifest = await indexer.manifest({ dir: 'foo/404' });

      expect(manifest.hash.files).to.eql(Hash.sha256([]));
      expect(manifest.files).to.eql([]);
    });

    it('file => dir', async () => {
      await copy('file.txt');
      await copy('images/bird.png');
      await copy('images/award.svg');

      const indexer = FsIndexerLocal({ fs: nodefs, dir });
      const manifest = await indexer.manifest({ dir: 'images/bird.png' }); // NB: File specified, steps up to containing folder.
      const files = manifest.files.map((file) => file.path);

      expect(manifest.files.length).to.eql(2);
      expect(files).to.eql(['images/award.svg', 'images/bird.png']);
    });
  });
});
