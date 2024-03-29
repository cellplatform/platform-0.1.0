import { Test, expect, TestFilesystem } from '../../test';

import { FsDriverLocal } from '..';
import { Hash, t, ManifestHash, time, Path } from '../common';

export default Test.describe('FsIndexer (IndexedDB)', (e) => {
  const EMPTY_HASH = Hash.sha256([]);

  const testCreate = async () => {
    const id = TestFilesystem.id;
    const fs = await FsDriverLocal({ id });
    return { fs, name: id, deleteAll: () => deleteAll(fs) };
  };

  const deleteAll = async (fs: t.FsIndexedDb) => {
    const manifest = await fs.index.manifest();
    for (const file of manifest.files) {
      await fs.driver.delete(`path:${file.path}`);
    }
  };

  const testFile = async (options: { path?: string; text?: string; fs?: t.FsIndexedDb } = {}) => {
    const { fs, path = 'dir/foo.txt', text = 'hello' } = options;
    const data = new TextEncoder().encode(text);
    const bytes = data.byteLength;
    const filehash = Hash.sha256(data);

    const file: t.ManifestFile = { path, bytes, filehash };
    const uri = `path:${path}`;

    if (fs) await fs.driver.write(uri, data);
    return { uri, file, data };
  };

  e.it('dir', async () => {
    const { fs } = await testCreate();
    expect(fs.index.dir).to.eql('/');
    fs.dispose();
  });

  e.describe('manifest', (e) => {
    e.it('empty', async () => {
      const { fs, deleteAll } = await testCreate();
      await deleteAll();

      const now = time.now.timestamp;
      const manifest = await fs.index.manifest();
      expect(manifest.kind).to.eql('dir');
      expect(manifest.dir.indexedAt).to.within(now - 10, now + 2000);
      expect(manifest.files).to.eql([]);
      expect(manifest.hash.files).to.eql(EMPTY_HASH);
      expect(manifest.hash).to.eql(ManifestHash.dir(manifest.dir, []));

      fs.dispose();
    });

    e.it('files (deep)', async () => {
      const { fs, deleteAll } = await testCreate();
      await deleteAll();

      const file1 = await testFile({ fs, path: '/file.txt' });
      const file2 = await testFile({ fs, path: '/images/bird.png' });
      const file3 = await testFile({ fs, path: 'images/foo/bar/icon.svg' });

      const now = time.now.timestamp;
      const manifest = await fs.index.manifest();
      const files = manifest.files;

      expect(manifest.kind).to.eql('dir');
      expect(manifest.dir.indexedAt).to.within(now - 30, now + 30);

      expect(files.length).to.eql(3);

      expect(files[0].filehash).to.eql(file1.file.filehash);
      expect(files[1].filehash).to.eql(file2.file.filehash);
      expect(files[2].filehash).to.eql(file3.file.filehash);

      expect(files[0].path).to.eql(Path.trimSlashesStart(file1.file.path));
      expect(files[1].path).to.eql(Path.trimSlashesStart(file2.file.path));
      expect(files[2].path).to.eql(Path.trimSlashesStart(file3.file.path));

      fs.dispose();
    });

    e.it('filter', async () => {
      const { fs, deleteAll } = await testCreate();
      await deleteAll();

      await testFile({ fs, path: '/file.txt' });
      await testFile({ fs, path: '/images/bird.png' });
      await testFile({ fs, path: '/foo/icon-1.svg' });
      await testFile({ fs, path: '/foo/zoo/icon-2.svg' });

      const manifest1 = await fs.index.manifest({ filter: (e) => !e.path.endsWith('.svg') });
      const manifest2 = await fs.index.manifest({ filter: (e) => !e.path.endsWith('.png') });

      const files1 = manifest1.files.map((file) => file.path);
      const files2 = manifest2.files.map((file) => file.path);

      expect(files1).to.eql(['file.txt', 'images/bird.png']);
      expect(files2).to.eql(['file.txt', 'foo/icon-1.svg', 'foo/zoo/icon-2.svg']);

      fs.dispose();
    });

    e.it('sub-dir', async () => {
      const { fs, deleteAll } = await testCreate();
      const mapFiles = (manifest: t.Manifest) => manifest.files.map((file) => file.path);
      await deleteAll();

      await testFile({ fs, path: '/file.txt' });
      await testFile({ fs, path: '/images/bird.png' });
      await testFile({ fs, path: '/foo/icon-1.svg' });
      await testFile({ fs, path: 'foo/bar/icon-2.svg' });

      const manifest0 = await fs.index.manifest({ dir: '      ' });

      const manifest1 = await fs.index.manifest({ dir: '   foo   ' });
      const manifest2 = await fs.index.manifest({ dir: '///foo///' });
      const manifest3 = await fs.index.manifest({ dir: 'foo/bar' });
      const manifest4 = await fs.index.manifest({ dir: '404' });
      const manifest5 = await fs.index.manifest({ dir: '/foo/bar/icon-2.svg' }); // NB: File specified, steps up to containing folder.

      const files0 = mapFiles(manifest0);
      const files1 = mapFiles(manifest1);
      const files2 = mapFiles(manifest2);
      const files3 = mapFiles(manifest3);
      const files4 = mapFiles(manifest4);
      const files5 = mapFiles(manifest5);

      expect(files0).to.eql([
        'file.txt',
        'foo/bar/icon-2.svg',
        'foo/icon-1.svg',
        'images/bird.png',
      ]);
      expect(files1).to.eql(['foo/bar/icon-2.svg', 'foo/icon-1.svg']);
      expect(files2).to.eql(files1);
      expect(files3).to.eql(['foo/bar/icon-2.svg']);
      expect(files4).to.eql([]);
      expect(files5).to.eql(['foo/bar/icon-2.svg']);

      fs.dispose();
    });

    e.it('natural sort', async () => {
      const { fs, deleteAll } = await testCreate();
      await deleteAll();

      const names1 = ['z1.doc', 'z10.doc', 'z17.doc', 'z2.doc', 'z23.doc', 'z3.doc'];

      for (const filename of names1) {
        const data = new TextEncoder().encode(filename);
        await fs.driver.write(`path:${filename}`, data);
      }

      const manifest = await fs.index.manifest();

      // NB: the paths are sorted in a "human/natural" way.
      const names2 = manifest.files.map((file) => file.path);
      expect(names2).to.not.eql(names1);
      expect(names2).to.eql(['z1.doc', 'z2.doc', 'z3.doc', 'z10.doc', 'z17.doc', 'z23.doc']);

      fs.dispose();
    });

    e.it('read: image meta-data', async () => {
      const { fs, deleteAll } = await testCreate();
      await deleteAll();

      const test = async (path: string, expected: t.ManifestFileImage) => {
        const uri = `path:${path}`;
        const body = (await fetch(path)).body as ReadableStream;
        await fs.driver.write(uri, body);

        const manifest = await fs.index.manifest();
        const file = manifest.files[0];
        expect(file.image).to.eql(expected);
      };

      await test('/static/test/kitten.jpg', { kind: 'jpg', width: 189, height: 147 });
      await test('/static/test/bird.png', { kind: 'png', width: 272, height: 226 });

      fs.dispose();
    });
  });
});
