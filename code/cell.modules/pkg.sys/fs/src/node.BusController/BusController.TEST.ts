import { t, expect, rx, TestFs } from '../test';
import { FsBus } from '.';

describe.only('BusController', function () {
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
    const { join, resolve } = TestFs.node;

    return {
      controller,
      events,
      dir: fs.dir,

      fs: TestFs.node,
      join,
      resolve,

      fileExists(path: string) {
        return TestFs.node.pathExists(TestFs.join(fs.dir, path));
      },

      async dispose() {
        controller.dispose();
        events.dispose();
      },
    };
  };

  describe('Info (Module)', () => {
    it('defaults', async () => {
      const id = 'foo';
      const fs = TestFs.local;
      const controller = FsBus.Controller({ id, fs, bus });
      const events = FsBus.Events({ id, bus });

      const res = await events.info.get();
      controller.dispose();

      expect(res.info?.dir).to.eql(TestFs.node.join(TestFs.tmp, 'root'));
    });

    it('filter (controller)', async () => {
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
      expect(res2.error).to.include('timed out');
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

      expect(info1.info?.id).to.eql('one');
      expect(info2.info?.id).to.eql('two');

      expect(info1.info?.dir).to.match(/\/foo$/);
      expect(info2.info?.dir).to.match(/\/bar$/);
    });
  });

  describe('io.read', () => {
    this.beforeEach(() => TestFs.reset());

    it.only('reads file (single)', async () => {
      const mock = prep();

      await mock.fs.copy(
        mock.resolve('static.test/child/tree.png'),
        mock.join(mock.dir, 'images/grow.png'),
      );

      const res = await mock.events.io.read.get('/images/grow.png');
      await mock.dispose();

      console.log('res', res);
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
