import { FsIndexer } from '.';
import { expect, util } from '../test';

describe('FsIndexer', () => {
  beforeEach(() => util.reset());

  const fs = util.node;
  const dir = util.PATH.LOCAL;

  const copy = async (source: string, target?: string) => {
    const from = fs.join(fs.resolve('static.test'), source);
    const to = fs.join(dir, target ?? source);
    const data = await fs.readFile(from);
    await fs.ensureDir(fs.dirname(to));
    await fs.writeFile(to, data);
    return to;
  };

  it('dir', () => {
    const dir = util.PATH.LOCAL;
    const indexer = FsIndexer({ fs, dir });
    expect(indexer.dir).to.eql(dir);
  });

  describe('manifest', () => {
    it('empty', async () => {
      const indexer = FsIndexer({ fs, dir });
      const manifest = await indexer.manifest();

      expect(manifest.kind).to.eql('dir');
      expect(typeof manifest.dir.indexedAt === 'number').to.eql(true);
      expect(manifest.files.length).to.eql(0);
    });

    it('files (deep)', async () => {
      await copy('file.txt');
      await copy('images/bird.png');
      await copy('images/award.svg', 'images/foo/bar/icon.svg');

      const indexer = FsIndexer({ fs, dir });
      const manifest = await indexer.manifest();

      expect(manifest.kind).to.eql('dir');
      expect(typeof manifest.dir.indexedAt === 'number').to.eql(true);
      expect(manifest.files.length).to.eql(3);
    });

    it('filter', async () => {
      await copy('file.txt');
      await copy('images/bird.png');
      await copy('images/award.svg', 'foo/icon-1.svg');
      await copy('images/award.svg', 'foo/bar/icon-2.svg');

      const indexer = FsIndexer({ fs, dir });
      const manifest1 = await indexer.manifest({ filter: (e) => !e.path.endsWith('.svg') });
      const manifest2 = await indexer.manifest({ filter: (e) => !e.path.endsWith('.png') });

      const files1 = manifest1.files.map((file) => file.path);
      const files2 = manifest2.files.map((file) => file.path);

      expect(files1).to.eql(['file.txt', 'images/bird.png']);
      expect(files2).to.eql(['file.txt', 'foo/icon-1.svg', 'foo/bar/icon-2.svg']);
    });

    it('sub-dir', async () => {
      await copy('file.txt');
      await copy('images/bird.png');
      await copy('images/award.svg', 'foo/icon-1.svg');
      await copy('images/award.svg', 'foo/bar/icon-2.svg');

      const indexer = FsIndexer({ fs, dir });
      const manifest1 = await indexer.manifest({ dir: 'foo' });
      const manifest2 = await indexer.manifest({ dir: fs.join(dir, 'foo') });

      const files1 = manifest1.files.map((file) => file.path);
      const files2 = manifest2.files.map((file) => file.path);

      expect(files1).to.eql(files2);
      expect(files1).to.eql(['foo/icon-1.svg', 'foo/bar/icon-2.svg']);
    });

    it('sub-dir: "" (empty)', async () => {
      await copy('file.txt');
      await copy('images/bird.png');

      const indexer = FsIndexer({ fs, dir });
      const manifest1 = await indexer.manifest({ dir: '' });
      const manifest2 = await indexer.manifest({ dir: '  ' });

      const files1 = manifest1.files.map((file) => file.path);
      const files2 = manifest2.files.map((file) => file.path);

      expect(files1).to.eql(files2);
      expect(files1).to.eql(['file.txt', 'images/bird.png']);
    });

    it('file => dir', async () => {
      await copy('file.txt');
      await copy('images/bird.png');
      await copy('images/award.svg');

      const indexer = FsIndexer({ fs, dir });
      const manifest = await indexer.manifest({ dir: 'images/bird.png' }); // NB: File specified, steps up to containing folder.
      const files = manifest.files.map((file) => file.path);

      expect(manifest.files.length).to.eql(2);
      expect(files).to.eql(['images/award.svg', 'images/bird.png']);
    });
  });
});
