import { t, expect, rx, TestFs, Hash } from '../test';
import { FsBus } from '.';

describe('BusController', function () {
  this.timeout(30000);

  const bus = rx.bus<t.SysFsEvent>();

  const prep = (options: { id?: string; dir?: string } = {}) => {
    const id = options.id ?? 'foo';

    const fs = !options.dir
      ? TestFs.local
      : TestFs.LocalFilesystem({
          dir: TestFs.node.join(TestFs.tmp, options.dir),
          fs: TestFs.node,
        });

    const controller = FsBus.Controller({ id, fs, bus });
    const events = FsBus.Events({ id, bus });

    return {
      controller,
      events,
      dir: fs.dir,
      fs: TestFs.node,

      fileExists(path: string) {
        return TestFs.node.pathExists(TestFs.join(fs.dir, path));
      },

      async dispose() {
        controller.dispose();
        events.dispose();
      },
    };
  };

  describe('controller', () => {
    it('id', () => {
      const id = 'foo';
      const fs = TestFs.local;
      const controller = FsBus.Controller({ id, fs, bus });
      expect(controller.id).to.eql(id);
      controller.dispose();
    });

    it('filter (global)', async () => {
      const id = 'foo';
      const fs = TestFs.local;

      let allow = true;
      const controller = FsBus.Controller({ id, fs, bus, filter: (e) => allow });
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

  describe('info (module)', () => {
    it('defaults - no files', async () => {
      const id = 'foo';
      const fs = TestFs.local;
      const controller = FsBus.Controller({ id, fs, bus });
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
      const controller = FsBus.Controller({ id: 'foo', fs, bus });
      const events = FsBus.Events({ id: 'bar', bus });

      const res = await events.info.get({ timeout: 10 });
      controller.dispose();

      expect(res.error?.code).to.eql('client/timeout');
      expect(res.error?.message).to.include('timed out');
    });
  });

  describe('io.read', () => {
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

  describe('io.write', () => {
    this.beforeEach(() => TestFs.reset());

    it('writes file (single)', async () => {
      const mock = prep();
      const before = await TestFs.readFile('static.test/child/kitten.jpg');
      const { hash, data } = before;

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
      const before1 = await TestFs.readFile('static.test/child/kitten.jpg');
      const before2 = await TestFs.readFile('static.test/child/tree.png');

      const path = {
        kitten: 'foo/bar/kitten.jpg',
        tree: 'foo/bar/tree.png',
      };
      expect(await mock.fileExists(path.kitten)).to.eql(false);
      expect(await mock.fileExists(path.tree)).to.eql(false);

      const res = await mock.events.io.write.fire([
        { path: 'foo/bar/kitten.jpg', hash: before1.hash, data: before1.data },
        { path: 'foo/bar/tree.png', hash: before2.hash, data: before2.data },
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

      expect(after1.hash).to.eql(before1.hash);
      expect(after1.data.toString()).to.eql(before1.data.toString());

      expect(after2.hash).to.eql(before2.hash);
      expect(after2.data.toString()).to.eql(before2.data.toString());
    });
  });
});
