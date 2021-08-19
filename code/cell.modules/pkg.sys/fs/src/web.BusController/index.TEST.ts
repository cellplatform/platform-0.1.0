import { t, expect, rx, TestFs, Hash, DEFAULT } from '../test';
import { FsBus } from '.';
import { Format } from './Format';
import { RouterMock, IRouterMock } from '@platform/cell.router/lib/test/RouterMock';

const fs = TestFs.node;

describe('FsBus', function () {
  this.timeout(30000);

  const bus = rx.bus<t.SysFsEvent>();

  const prep = (options: { id?: string; dir?: string } = {}) => {
    const id = options.id ?? 'foo';

    const fs = !options.dir
      ? TestFs.local
      : TestFs.FsLocal({
          dir: TestFs.node.join(TestFs.tmp, options.dir),
          fs: TestFs.node,
        });

    const index = TestFs.index(fs.dir);
    const controller = FsBus.Controller({ id, bus, fs, index });
    const events = FsBus.Events({ id, bus });

    let server: IRouterMock | undefined;

    return {
      controller,
      events,
      dir: Format.dir.ensureTrailingSlash(fs.dir),
      fs: TestFs.node,

      fileExists(path: string) {
        return TestFs.node.pathExists(TestFs.join(fs.dir, path));
      },

      async server() {
        if (server) return server;
        return (server = await RouterMock.create());
      },

      async dispose() {
        controller.dispose();
        events.dispose();
        server?.dispose();
      },
    };
  };

  describe('BusController', () => {
    it('id', () => {
      const id = 'foo';
      const fs = TestFs.local;
      const index = TestFs.index(fs.dir);
      const controller = FsBus.Controller({ id, fs, bus, index });
      expect(controller.id).to.eql(id);
      controller.dispose();
    });

    it('filter (global)', async () => {
      const id = 'foo';
      const fs = TestFs.local;

      let allow = true;
      const index = TestFs.index(fs.dir);
      const controller = FsBus.Controller({ id, fs, index, bus, filter: (e) => allow });
      const events = FsBus.Events({ id, bus });

      const res1 = await events.info.get();
      allow = false;
      const res2 = await events.info.get({ timeout: 10 });
      controller.dispose();

      expect(res1.error).to.eql(undefined);
      expect(res2.error?.code).to.eql('client/timeout');
      expect(res2.error?.message).to.include('timed out');
    });

    it('distinct (by filesystem "id")', async () => {
      const one = prep({ id: 'one', dir: 'foo' });
      const two = prep({ id: 'two', dir: 'bar' });

      const info1 = await one.events.info.get();
      const info2 = await two.events.info.get();

      one.dispose();
      two.dispose();

      expect(info1.id).to.eql('one');
      expect(info2.id).to.eql('two');

      expect(info1.fs?.id).to.eql('one');
      expect(info2.fs?.id).to.eql('two');

      expect(info1.fs?.dir).to.match(/\/foo$/);
      expect(info2.fs?.dir).to.match(/\/bar$/);
    });
  });

  describe('BusController.info', () => {
    it('defaults - no files', async () => {
      const id = 'foo';
      const fs = TestFs.local;
      const index = TestFs.index(fs.dir);
      const controller = FsBus.Controller({ id, fs, index, bus });
      const events = FsBus.Events({ id, bus });

      const res = await events.info.get();
      controller.dispose();

      expect(res.id).to.eql(id);
      expect(res.fs?.id).to.eql(id);
      expect(res.fs?.dir).to.eql(TestFs.node.join(TestFs.tmp, 'root'));
      expect(res.files).to.eql([]);
      expect(res.error).to.eql(undefined);
    });

    it('not found', async () => {
      const mock = prep();
      const info = await mock.events.info.get({ path: '/foo/bar.js', timeout: 10 });
      await mock.dispose();

      expect(info.files.length).to.eql(1);

      const file = info.files[0];
      expect(file.exists).to.eql(false);
      expect(file.hash).to.eql('');
      expect(file.bytes).to.eql(-1);
    });

    it('single file', async () => {
      const mock = prep();
      const src = await TestFs.readFile('static.test/child/kitten.jpg');

      const path = '  foo/bar/kitty.jpg   '; // NB: spacing trimmed.
      await mock.events.io.write.fire({ path, hash: src.hash, data: src.data });

      const info = await mock.events.info.get({ path, timeout: 10 });
      await mock.dispose();
      expect(info.files.length).to.eql(1);

      expect(info.files[0].path).to.eql('/foo/bar/kitty.jpg'); // NB: starts at absolute "/"
      expect(info.files[0].hash).to.eql(src.hash);
      expect(info.files[0].bytes).to.eql(src.data.byteLength);
    });

    it('multiple files', async () => {
      const mock = prep();
      const src1 = await TestFs.readFile('static.test/child/kitten.jpg');
      const src2 = await TestFs.readFile('static.test/child/tree.png');

      const path1 = '/foo/bar/kitty.jpg';
      const path2 = '/foo/bar/grow.png';
      await mock.events.io.write.fire({ path: path1, hash: src1.hash, data: src1.data });
      await mock.events.io.write.fire({ path: path2, hash: src2.hash, data: src2.data });

      const info = await mock.events.info.get({ path: [path1, path2], timeout: 10 });
      await mock.dispose();
      expect(info.files.length).to.eql(2);

      expect(info.files[0].path).to.eql(path1);
      expect(info.files[0].hash).to.eql(src1.hash);
      expect(info.files[0].bytes).to.eql(src1.data.byteLength);

      expect(info.files[1].path).to.eql(path2);
      expect(info.files[1].hash).to.eql(src2.hash);
      expect(info.files[1].bytes).to.eql(src2.data.byteLength);
    });

    it('error: timeout', async () => {
      const fs = TestFs.local;
      const index = TestFs.index(fs.dir);
      const controller = FsBus.Controller({ id: 'foo', fs, index, bus });
      const events = FsBus.Events({ id: 'bar', bus });

      const res = await events.info.get({ timeout: 10 });
      controller.dispose();

      expect(res.error?.code).to.eql('client/timeout');
      expect(res.error?.message).to.include('timed out');
    });
  });

  describe('BusController.Index', () => {
    this.beforeEach(() => TestFs.reset());

    type R = t.SysFsManifestDirResponse;
    const asFiles = (dir: R) => dir.manifest.files.map((file) => file.path);

    describe('manifest', () => {
      it('empty', async () => {
        const mock = prep();
        const res = await mock.events.index.manifest.get();
        await mock.dispose();

        const item = res.dirs[0];
        const manifest = item.manifest;

        expect(res.dirs.length).to.eql(1);
        expect(item.dir).to.eql(mock.dir);

        expect(manifest.kind).to.eql('dir');
        expect(typeof manifest.dir.indexedAt === 'number').to.eql(true);
        expect(manifest.files).to.eql([]);
        expect(manifest.hash.files).to.eql(Hash.sha256([]));
      });

      it('root (no "dir" parameter passed)', async () => {
        const mock = prep();
        const src1 = await TestFs.readFile('static.test/data/01.json');
        const src2 = await TestFs.readFile('static.test/child/tree.png');

        const path1 = '/foo/data.json';
        const path2 = '/bar/tree.png';
        await mock.events.io.write.fire({ path: path1, hash: src1.hash, data: src1.data });
        await mock.events.io.write.fire({ path: path2, hash: src2.hash, data: src2.data });

        const res = await mock.events.index.manifest.get();
        await mock.dispose();

        const item = res.dirs[0];
        const manifest = item.manifest;

        expect(res.dirs.length).to.eql(1);
        expect(item.dir).to.eql(mock.dir);

        expect(manifest.kind).to.eql('dir');
        expect(typeof manifest.dir.indexedAt === 'number').to.eql(true);

        const files = manifest.files;
        expect(files.length).to.eql(2);
        expect(files.map(({ path }) => path)).to.eql(['bar/tree.png', 'foo/data.json']);

        expect(files[0].image?.kind).to.eql('png');
        expect(files[1].image).to.eql(undefined);
      });

      it('empty "dir" param variants (return root)', async () => {
        const mock = prep();
        const io = mock.events.io;
        const src = await TestFs.readFile('static.test/data/01.json');
        const write = (path: string) => io.write.fire({ path, hash: src.hash, data: src.data });

        await write('/root.json');
        await write('/data/foo/data.json');
        await write('/data/foo/child/list.json');
        const all = ['root.json', 'data/foo/data.json', 'data/foo/child/list.json'];

        const test = async (dir: string | string[]) => {
          const res = await mock.events.index.manifest.get({ dir });
          expect(res.dirs.length).to.eql(1);
          expect(asFiles(res.dirs[0])).to.eql(all);
        };

        await test('');
        await test('  ');
        await test('/');
        await test('  /  ');
        await test([]);
        await test(['']);
        await test(['  ']);
        await test(['/']);
        await test([' / ']);
        await test(['', '   ', '']);
        await test(['/', '', '  /  ', ' ']);

        await mock.dispose();
      });

      it('multiple sub-trees', async () => {
        const mock = prep();
        const io = mock.events.io;
        const src = await TestFs.readFile('static.test/data/01.json');
        const write = (path: string) => io.write.fire({ path, hash: src.hash, data: src.data });

        await write('/root.json');
        await write('/data/foo/data.json');
        await write('/data/foo/child/list.json');
        await write('/logs/archive/main.log');
        await write('/logs/main.log');
        const all = [
          'root.json',
          'data/foo/data.json',
          'data/foo/child/list.json',
          'logs/main.log',
          'logs/archive/main.log',
        ];

        const dir = ['  ', '/', '    /data/foo  ', '  logs  ', '/404'];
        const res = await mock.events.index.manifest.get({ dir });
        await mock.dispose();

        const files1 = asFiles(res.dirs[0]);
        const files2 = asFiles(res.dirs[1]);
        const files3 = asFiles(res.dirs[2]);
        const files4 = asFiles(res.dirs[3]);

        expect(files1).to.eql(all); // NB: The first two parameter entries collapse into a single index (the "root")
        expect(files2).to.eql(['data/foo/data.json', 'data/foo/child/list.json']);
        expect(files3).to.eql(['logs/main.log', 'logs/archive/main.log']);
        expect(files4).to.eql([]);
      });

      it('error: binary not an image, but named with an image extension ', async () => {
        const mock = prep();
        const io = mock.events.io;
        const src = await TestFs.readFile('static.test/data/01.json');
        const write = (path: string) => io.write.fire({ path, hash: src.hash, data: src.data });

        await write('json.png'); // NB: Writing the JSON file with an image file-extension.

        const res = await mock.events.index.manifest.get({});
        await mock.dispose();

        expect(res.dirs.length).to.eql(1);

        const manifest = res.dirs[0].manifest;
        const files = manifest.files;

        expect(files.length).to.eql(1);
        expect(files[0].path).to.eql('json.png');
        expect(files[0].image).to.eql(undefined); // NB: Not assigned as this is not really an image.
      });
    });

    describe('manifest caching', () => {
      const cachePrep = async () => {
        const mock = prep();
        const io = mock.events.io;
        const src = await TestFs.readFile('static.test/data/01.json');
        const write = (path: string) => io.write.fire({ path, hash: src.hash, data: src.data });

        await write('/root.json');
        await write('/data/bar/list.json');
        await write('/data/foo/data.json');

        const all = ['root.json', 'data/bar/list.json', 'data/foo/data.json'];
        const cachefile = fs.join(mock.dir, DEFAULT.CACHE_FILENAME);

        const loadCachedFile = async () => {
          if (!(await fs.exists(cachefile))) return undefined;
          return (await fs.readJson(cachefile)) as t.DirManifest;
        };

        return { mock, all, cachefile, loadCachedFile };
      };

      it('no caching - default', async () => {
        const { mock, all, cachefile } = await cachePrep();
        const test = async (cache: boolean | undefined) => {
          const res = await mock.events.index.manifest.get({ cache });
          expect(await fs.exists(cachefile)).to.eql(false);

          const files = asFiles(res.dirs[0]);
          expect(files).to.eql(all);
        };

        await test(undefined);
        await test(false);

        await mock.dispose();
      });

      it('cache:true (uses cache)', async () => {
        const { mock, all, cachefile, loadCachedFile } = await cachePrep();
        expect(await loadCachedFile()).to.eql(undefined);

        const res1 = await mock.events.index.manifest.get({ cache: true });
        expect(asFiles(res1.dirs[0])).to.eql(all);
        expect(await fs.exists(cachefile)).to.eql(true);
        expect(await loadCachedFile()).to.eql(res1.dirs[0].manifest);

        // Manipulate the cached file to test if it's used.
        const json = await loadCachedFile();
        (json?.files[0] as any).foobar = 'my-test';
        await fs.writeJson(cachefile, json);

        // Requery and ensure the cached version is returned.
        const res2 = await mock.events.index.manifest.get({ cache: true });
        expect((res2.dirs[0].manifest.files[0] as any).foobar).to.eql('my-test');

        await mock.dispose();
      });

      it('cache: "force"', async () => {
        const { mock, cachefile, loadCachedFile } = await cachePrep();
        expect(await loadCachedFile()).to.eql(undefined);

        const res1 = await mock.events.index.manifest.get({ cache: true });
        expect((res1.dirs[0].manifest.files[0] as any).foobar).to.eql(undefined);

        // Manipulate the cached file to test if it's used.
        const json = await loadCachedFile();
        (json?.files[0] as any).foobar = 'my-test';
        await fs.writeJson(cachefile, json);

        // Requery and ensure the cached version is returned.
        const res2 = await mock.events.index.manifest.get({ cache: true });
        expect((res2.dirs[0].manifest.files[0] as any).foobar).to.eql('my-test');

        // Query again and "force".
        const res3 = await mock.events.index.manifest.get({ cache: 'force' });
        expect((res3.dirs[0].manifest.files[0] as any).foobar).to.eql(undefined);
        expect(await loadCachedFile()).to.eql(res3.dirs[0].manifest);

        await mock.dispose();
      });

      it('does not include .cache file within manifest', async () => {
        const { mock, loadCachedFile } = await cachePrep();
        expect(await loadCachedFile()).to.eql(undefined);

        const res1 = await mock.events.index.manifest.get({ cache: true });
        const res2 = await mock.events.index.manifest.get({ cache: 'force' });

        const expectNoCachefile = (dir: t.SysFsManifestDirResponse) => {
          const files = asFiles(dir);
          const exists = files.some((file) => file.endsWith(DEFAULT.CACHE_FILENAME));
          expect(exists).to.eql(false);
        };

        expectNoCachefile(res1.dirs[0]);
        expectNoCachefile(res2.dirs[0]);

        await mock.dispose();
      });

      it('save within multiple dirs', async () => {
        const { mock } = await cachePrep();

        await mock.events.index.manifest.get({
          dir: ['/', 'data/foo', '/data/bar', 'data/404'],
          cache: true,
        });

        const cacheFile = (path: string) => fs.join(path, DEFAULT.CACHE_FILENAME);

        const expectExists = async (path: string, expected: boolean) => {
          path = fs.join(mock.dir, path);
          const exists = await fs.exists(path);
          expect(exists).to.eql(expected);
        };
        await expectExists('data/404', false); // NB: When a folder doesn't exist, it is not created by the cache.
        await expectExists(cacheFile('/'), true);
        await expectExists(cacheFile('data/foo'), true);
        await expectExists(cacheFile('data/bar'), true);

        await mock.dispose();
      });
    });
  });

  describe('BusController.IO', () => {
    describe('read', () => {
      this.beforeEach(() => TestFs.reset());

      it('reads file (single)', async () => {
        const mock = prep();
        await mock.fs.copy(
          mock.fs.resolve('static.test/child/tree.png'),
          mock.fs.join(mock.dir, 'images/tree.png'),
        );

        const res = await mock.events.io.read.get('/images/tree.png');
        await mock.dispose();

        expect(res.error).to.eql(undefined);
        expect(res.files.length).to.eql(1);

        const files = res.files.map(({ file }) => file);
        const original = await TestFs.readFile(mock.fs.join(mock.dir, 'images/tree.png'));

        expect(files[0]?.hash).to.eql(original.hash);
        expect(original.data.toString()).to.eql(files[0]?.data.toString());
      });

      it('reads files (multiple)', async () => {
        const mock = prep();
        await mock.fs.copy(
          mock.fs.resolve('static.test/child/tree.png'),
          mock.fs.join(mock.dir, 'images/tree.png'),
        );
        await mock.fs.copy(
          mock.fs.resolve('static.test/child/kitten.jpg'),
          mock.fs.join(mock.dir, 'images/kitten.jpg'),
        );

        const res = await mock.events.io.read.get(['/images/tree.png', 'images/kitten.jpg']);
        await mock.dispose();

        expect(res.error).to.eql(undefined);
        expect(res.files.length).to.eql(2);

        const files = res.files.map(({ file }) => file);
        const original1 = await TestFs.readFile(mock.fs.join(mock.dir, 'images/tree.png'));
        const original2 = await TestFs.readFile(mock.fs.join(mock.dir, 'images/kitten.jpg'));

        expect(files[0]?.hash).to.eql(original1.hash);
        expect(files[1]?.hash).to.eql(original2.hash);

        expect(original1.data.toString()).to.eql(files[0]?.data.toString());
        expect(original2.data.toString()).to.eql(files[1]?.data.toString());
      });
    });

    describe('write', () => {
      this.beforeEach(() => TestFs.reset());

      it('writes file (single)', async () => {
        const mock = prep();
        const src = await TestFs.readFile('static.test/child/kitten.jpg');
        const { hash, data } = src;

        const path = 'foo/bar/kitten.jpg';
        expect(await mock.fileExists(path)).to.eql(false);

        const res = await mock.events.io.write.fire({ path: 'foo/bar/kitten.jpg', hash, data });
        await mock.dispose();

        expect(res.error).to.eql(undefined);
        expect(res.files.length).to.eql(1);
        expect(res.files[0].path).to.eql('/foo/bar/kitten.jpg'); // Absolute path ("/..") starting at [fs.dir] root.
        expect(await mock.fileExists(path)).to.eql(true);

        const after = await TestFs.readFile(TestFs.join(mock.dir, 'foo/bar/kitten.jpg'));
        expect(after.hash).to.eql(hash);
        expect(after.data.toString()).to.eql(data.toString());
      });

      it('write files (multiple)', async () => {
        const mock = prep();
        const src1 = await TestFs.readFile('static.test/child/kitten.jpg');
        const src2 = await TestFs.readFile('static.test/child/tree.png');

        const path = {
          kitten: 'foo/bar/kitten.jpg',
          tree: 'foo/bar/tree.png',
        };
        expect(await mock.fileExists(path.kitten)).to.eql(false);
        expect(await mock.fileExists(path.tree)).to.eql(false);

        const res = await mock.events.io.write.fire([
          { path: 'foo/bar/kitten.jpg', hash: src1.hash, data: src1.data },
          { path: 'foo/bar/tree.png', hash: src2.hash, data: src2.data },
        ]);
        await mock.dispose();

        expect(res.error).to.eql(undefined);
        expect(res.files.length).to.eql(2);
        expect(res.files[0].path).to.eql('/foo/bar/kitten.jpg');
        expect(res.files[1].path).to.eql('/foo/bar/tree.png');
        expect(await mock.fileExists(path.kitten)).to.eql(true);
        expect(await mock.fileExists(path.tree)).to.eql(true);

        const after1 = await TestFs.readFile(TestFs.join(mock.dir, 'foo/bar/kitten.jpg'));
        const after2 = await TestFs.readFile(TestFs.join(mock.dir, 'foo/bar/tree.png'));

        expect(after1.hash).to.eql(src1.hash);
        expect(after1.data.toString()).to.eql(src1.data.toString());

        expect(after2.hash).to.eql(src2.hash);
        expect(after2.data.toString()).to.eql(src2.data.toString());
      });
    });

    describe('delete', () => {
      this.beforeEach(() => TestFs.reset());

      it('delete (does not exist)', async () => {
        const mock = prep();

        const res = await mock.events.io.delete.fire('foo/404.txt');
        await mock.dispose();

        expect(res.files.length).to.eql(1);
        expect(res.files[0].path).to.eql('/foo/404.txt');
        expect(res.files[0].error).to.eql(undefined);
      });

      it('delete (single)', async () => {
        const mock = prep();
        const src = await TestFs.readFile('static.test/child/kitten.jpg');
        const { hash, data } = src;

        const path = 'foo/bar/kitten.jpg';
        await mock.events.io.write.fire({ path, hash, data });
        expect(await mock.fileExists(path)).to.eql(true);

        const res = await mock.events.io.delete.fire(path);
        await mock.dispose();
        expect(await mock.fileExists(path)).to.eql(false);

        expect(res.files.length).to.eql(1);
        expect(res.files[0].path).to.eql('/foo/bar/kitten.jpg');
        expect(res.files[0].error).to.eql(undefined);
      });

      it('delete (multiple)', async () => {
        const mock = prep();
        const src1 = await TestFs.readFile('static.test/child/kitten.jpg');
        const src2 = await TestFs.readFile('static.test/child/tree.png');

        const path1 = 'foo/bar/milk.jpg';
        const path2 = 'foo/bar/green.png';

        await mock.events.io.write.fire([
          { path: path1, hash: src1.hash, data: src1.data },
          { path: path2, hash: src2.hash, data: src2.data },
        ]);
        expect(await mock.fileExists(path1)).to.eql(true);
        expect(await mock.fileExists(path2)).to.eql(true);

        const res = await mock.events.io.delete.fire([path1, path2]);
        await mock.dispose();
        expect(await mock.fileExists(path1)).to.eql(false);
        expect(await mock.fileExists(path2)).to.eql(false);

        expect(res.files.length).to.eql(2);

        expect(res.files[0].path).to.eql('/foo/bar/milk.jpg');
        expect(res.files[0].error).to.eql(undefined);

        expect(res.files[1].path).to.eql('/foo/bar/green.png');
        expect(res.files[1].error).to.eql(undefined);
      });
    });

    describe('copy', () => {
      this.beforeEach(() => TestFs.reset());

      it('copy (single)', async () => {
        const mock = prep();
        const src = await TestFs.readFile('static.test/child/kitten.jpg');
        const { hash, data } = src;

        const path = {
          source: 'foo/bar/kitten.jpg',
          target: 'cat.jpg',
        };
        await mock.events.io.write.fire({ path: path.source, hash, data });
        expect(await mock.fileExists(path.source)).to.eql(true);

        const res = await mock.events.io.copy.fire({ source: path.source, target: path.target });
        await mock.dispose();

        expect(res.error).to.eql(undefined);
        expect(res.files.length).to.eql(1);

        expect(res.files[0].source).to.eql('/foo/bar/kitten.jpg');
        expect(res.files[0].target).to.eql('/cat.jpg');

        expect(await mock.fileExists(path.source)).to.eql(true);
        expect(await mock.fileExists(path.target)).to.eql(true);
      });

      it('copy (multiple)', async () => {
        const mock = prep();
        const src = await TestFs.readFile('static.test/child/kitten.jpg');
        const { hash, data } = src;

        const path1 = {
          source: 'foo/bar/kitten.jpg',
          target: 'cat.jpg',
        };

        const path2 = {
          source: 'foo/bar/kitten.jpg',
          target: 'animals/feline.jpg',
        };

        await mock.events.io.write.fire({ path: path1.source, hash, data });
        expect(await mock.fileExists(path1.source)).to.eql(true);

        const res = await mock.events.io.copy.fire([
          { source: path1.source, target: path1.target },
          { source: path2.source, target: path2.target },
        ]);
        await mock.dispose();

        expect(res.files.length).to.eql(2);
        expect(res.error).to.eql(undefined);

        expect(res.files[0].source).to.eql('/foo/bar/kitten.jpg');
        expect(res.files[0].target).to.eql('/cat.jpg');

        expect(res.files[1].source).to.eql('/foo/bar/kitten.jpg');
        expect(res.files[1].target).to.eql('/animals/feline.jpg');

        expect(await mock.fileExists(path1.source)).to.eql(true);
        expect(await mock.fileExists(path1.target)).to.eql(true);

        expect(await mock.fileExists(path2.source)).to.eql(true);
        expect(await mock.fileExists(path2.target)).to.eql(true);
      });

      it('copy error (source not found)', async () => {
        const mock = prep();

        const res = await mock.events.io.copy.fire([
          { source: 'foo/bar/kitten.jpg', target: 'cat.jpg' },
        ]);
        await mock.dispose();

        expect(res.files.length).to.eql(1);
        expect(res.error?.code).to.eql('copy');
        expect(res.error?.message).to.include('Failed while copying');

        expect(res.files[0].error?.code).to.eql('copy');
        expect(res.files[0].error?.message).to.include('no such file or directory');
      });
    });

    describe('move (copy + delete)', () => {
      this.beforeEach(() => TestFs.reset());

      it('move', async () => {
        const mock = prep();
        const src = await TestFs.readFile('static.test/child/kitten.jpg');
        const { hash, data } = src;

        const path = {
          source: 'foo/bar/kitten.jpg',
          target: 'cat.jpg',
        };
        await mock.events.io.write.fire({ path: path.source, hash, data });
        expect(await mock.fileExists(path.source)).to.eql(true);
        expect(await mock.fileExists(path.target)).to.eql(false);

        const res = await mock.events.io.move.fire({ source: path.source, target: path.target });
        await mock.dispose();

        expect(res.files.length).to.eql(1);
        expect(res.error).to.eql(undefined);

        expect(res.files[0].source).to.eql('/foo/bar/kitten.jpg');
        expect(res.files[0].target).to.eql('/cat.jpg');
        expect(res.files[0].error).to.eql(undefined);

        expect(await mock.fileExists(path.source)).to.eql(false);
        expect(await mock.fileExists(path.target)).to.eql(true);
      });

      it('error', async () => {
        const mock = prep();
        const path = {
          source: 'foo/bar/kitten.jpg',
          target: 'cat.jpg',
        };
        const res = await mock.events.io.move.fire({ source: path.source, target: path.target });
        await mock.dispose();

        expect(res.files.length).to.eql(1);
        expect(res.error?.code).to.eql('move');
        expect(res.error?.message).to.include('Failed while moving');

        expect(res.files[0].source).to.eql('/foo/bar/kitten.jpg');
        expect(res.files[0].target).to.eql('/cat.jpg');
        expect(res.files[0].error?.code).to.eql('copy');
        expect(res.files[0].error?.message).to.include('no such file or directory');
      });
    });
  });

  describe.only('BusController.Cell', () => {
    it.only('TMP', async () => {
      const mock = await RouterMock.create();

      // mock.

      console.log('mock', mock.origin);

      const res = await mock.client.info();
      console.log('res', res.body);

      mock.dispose();
    });
  });
});
