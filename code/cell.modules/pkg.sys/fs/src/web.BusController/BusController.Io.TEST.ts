import { t, rx, expect, TestFs } from '../test';
import { TestPrep } from './BusController.TEST';
import { FsBus } from '.';

const fs = TestFs.node;

describe('BusController.IO', function () {
  describe('BusController.info', function () {
    it('defaults - no files', async () => {
      const bus = rx.bus<t.SysFsEvent>();
      const id = 'foo';
      const fs = TestFs.local;
      const index = TestFs.index(fs.dir);
      const controller = FsBus.Controller({ id, fs, index, bus });
      const events = FsBus.Events({ id, bus });

      const res = await events.io.info.get();
      controller.dispose();

      expect(res.id).to.eql(id);
      expect(res.fs?.id).to.eql(id);
      expect(res.fs?.dir).to.eql(TestFs.local.dir);
      expect(res.files).to.eql([]);
      expect(res.error).to.eql(undefined);
    });

    it('not found', async () => {
      const mock = await TestPrep();
      const info = await mock.events.io.info.get({ path: '/foo/bar.js', timeout: 10 });
      await mock.dispose();

      expect(info.files.length).to.eql(1);

      const file = info.files[0];
      expect(file.exists).to.eql(false);
      expect(file.hash).to.eql('');
      expect(file.bytes).to.eql(-1);
    });

    it('single file', async () => {
      const mock = await TestPrep();
      const src = await TestFs.readFile('static.test/child/kitten.jpg');

      const path = '  foo/bar/kitty.jpg   '; // NB: spacing trimmed.
      await mock.events.io.write.fire({ path, hash: src.hash, data: src.data });

      const info = await mock.events.io.info.get({ path, timeout: 10 });
      await mock.dispose();
      expect(info.files.length).to.eql(1);

      expect(info.files[0].path).to.eql('/foo/bar/kitty.jpg'); // NB: starts at absolute "/"
      expect(info.files[0].hash).to.eql(src.hash);
      expect(info.files[0].bytes).to.eql(src.data.byteLength);
    });

    it('multiple files', async () => {
      const mock = await TestPrep();
      const src1 = await TestFs.readFile('static.test/child/kitten.jpg');
      const src2 = await TestFs.readFile('static.test/child/tree.png');

      const path1 = '/foo/bar/kitty.jpg';
      const path2 = '/foo/bar/grow.png';
      await mock.events.io.write.fire({ path: path1, hash: src1.hash, data: src1.data });
      await mock.events.io.write.fire({ path: path2, hash: src2.hash, data: src2.data });

      const info = await mock.events.io.info.get({ path: [path1, path2], timeout: 10 });
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
      const bus = rx.bus<t.SysFsEvent>();
      const fs = TestFs.local;
      const index = TestFs.index(fs.dir);
      const controller = FsBus.Controller({ id: 'foo', fs, index, bus });
      const events = FsBus.Events({ id: 'bar', bus });

      const res = await events.io.info.get({ timeout: 10 });
      controller.dispose();

      expect(res.error?.code).to.eql('client/timeout');
      expect(res.error?.message).to.include('timed out');
    });
  });

  describe('read', function () {
    this.beforeEach(() => TestFs.reset());

    it('reads file (single)', async () => {
      const mock = await TestPrep();
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
      const mock = await TestPrep();
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

    it('error: "read/404"', async () => {
      const mock = await TestPrep();

      const res = await mock.events.io.read.get('path:/images/tree.png');
      const file = res.files[0];
      await mock.dispose();

      expect(res.error?.code).to.eql('read');
      expect(res.error?.message).to.include('Failed while reading');

      expect(file.error?.code).to.eql('read/404');
      expect(file.error?.message).to.include('File not found');
      expect(file.error?.path).to.eql('/images/tree.png');
    });
  });

  describe('write', function () {
    this.beforeEach(() => TestFs.reset());

    it('writes file (single)', async () => {
      const mock = await TestPrep();
      const src = await TestFs.readFile('static.test/child/kitten.jpg');
      const { hash, data } = src;

      const path = 'foo/bar/kitten.jpg';
      expect(await mock.fileExists(path)).to.eql(false);

      const res = await mock.events.io.write.fire({ path: 'foo/bar/kitten.jpg', hash, data });
      await mock.dispose();

      expect(res.error).to.eql(undefined);
      expect(res.files.length).to.eql(1);
      expect(res.files[0].path).to.eql('/foo/bar/kitten.jpg'); // Absolute path ("/..") starting at [fs.dir] root.
      expect(res.files[0].hash).to.eql(src.hash);
      expect(await mock.fileExists(path)).to.eql(true);

      const after = await TestFs.readFile(TestFs.join(mock.dir, 'foo/bar/kitten.jpg'));
      expect(after.hash).to.eql(hash);
      expect(after.data.toString()).to.eql(data.toString());
    });

    it('write files (multiple)', async () => {
      const mock = await TestPrep();
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
      expect(res.files[0].hash).to.eql(src1.hash);
      expect(res.files[1].hash).to.eql(src2.hash);
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

  describe('delete', function () {
    this.beforeEach(() => TestFs.reset());

    it('delete (does not exist)', async () => {
      const mock = await TestPrep();

      const res = await mock.events.io.delete.fire('foo/404.txt');
      await mock.dispose();

      expect(res.files.length).to.eql(1);
      expect(res.files[0].path).to.eql('/foo/404.txt');
      expect(res.files[0].error).to.eql(undefined);
    });

    it('delete (single)', async () => {
      const mock = await TestPrep();
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
      const mock = await TestPrep();
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

  describe('copy', function () {
    this.beforeEach(() => TestFs.reset());

    it('copy (single)', async () => {
      const mock = await TestPrep();
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
      const mock = await TestPrep();
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
      const mock = await TestPrep();

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

  describe('move (copy + delete)', function () {
    this.beforeEach(() => TestFs.reset());

    it('move', async () => {
      const mock = await TestPrep();
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
      const mock = await TestPrep();
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
