import { expect, expectError, Hash, Path, TestFs, TestPrep } from '../test';

const fs = TestFs.node;

describe('BusEvents.Fs', function () {
  this.beforeEach(() => TestFs.reset());

  describe('read', () => {
    it('not found: <undefined>', async () => {
      const mock = await TestPrep();
      const fs = mock.events.fs();

      const res = await fs.read('404.png');
      await mock.dispose();

      expect(res).to.eql(undefined);
    });

    it('binary: Uint8Array', async () => {
      const mock = await TestPrep();
      const file = await mock.copy('static.test/child/tree.png', 'images/tree.png');
      const fs = mock.events.fs();

      const test = async (path: string) => {
        const res = await fs.read(path);
        expect(Hash.sha256(res)).to.eql(file.hash);
      };

      await test('/images/tree.png');
      await test('///images/tree.png');
      await test('  images/tree.png  ');

      await mock.dispose();
    });

    it('read within "/sub-directory"', async () => {
      const mock = await TestPrep();
      const file = await mock.copy('static.test/child/tree.png', 'images/tree.png');

      const test = async (subdir: string, path: string) => {
        const fs = mock.events.fs({ subdir });
        const res = await fs.read(path);
        expect(Hash.sha256(res)).to.eql(file.hash);
      };

      await test('images', '/tree.png');
      await test('  /images  ', '  tree.png  ');

      await mock.dispose();
    });
  });

  describe('write', () => {
    it('write binary file', async () => {
      const mock = await TestPrep();
      const data = await mock.readFile('static.test/child/tree.png');
      const localfs = mock.events.fs();

      const test = async (path: string) => {
        await mock.reset();

        const targetPath = fs.join(mock.rootDir, Path.trim(path));
        const exists = async () => await fs.exists(targetPath);

        expect(await exists()).to.eql(false); // Not yet copied.

        // Write.
        const res = await localfs.write(path, data.data);

        expect(await exists()).to.eql(true); // Exists now.

        const file = (await mock.readFile(targetPath)).data;

        const hash = Hash.sha256(file);
        expect(hash).to.eql(data.hash);
        expect(res.hash).to.eql(hash);
        expect(res.bytes).to.eql(file.byteLength);
      };

      await test('images/tree.png');
      await test('  images/tree.png  ');
      await test('    /images/tree.png   ');

      await mock.dispose();
    });

    it('write string', async () => {
      const mock = await TestPrep();
      const localfs = mock.events.fs();

      const path = 'foo.txt';
      const targetPath = fs.join(mock.rootDir, path);

      expect(await fs.exists(targetPath)).to.eql(false);

      const data = 'hello world!';
      const res = await localfs.write(path, data);

      const file = await mock.readFile(targetPath);
      const hash = Hash.sha256(file.data);
      expect(file.hash).to.eql(hash);
      expect(res.hash).to.eql(hash);
      expect(new TextDecoder().decode(file.data)).to.eql(data);

      await mock.dispose();
    });

    it('write from node-js', async () => {
      const mock = await TestPrep();
      const localfs = mock.events.fs();
      const data = await fs.readFile('static.test/data.json');

      const path = 'foo/bar.json';
      await localfs.write(path, data);

      const target = await fs.readJson(fs.join(mock.rootDir, path));
      expect(target).to.eql(JSON.parse(data.toString()));

      await mock.dispose();
    });

    it('throw: no data', async () => {
      const mock = await TestPrep();
      const localfs = mock.events.fs();

      const test = async (data: any) => {
        const fn = () => localfs.write('tree.png', data);
        await expectError(fn, 'No data');
      };

      await test(null);
      await test(undefined);

      await mock.dispose();
    });

    it.skip('throw: invalid data', async () => {
      const mock = await TestPrep();
      const localfs = mock.events.fs();

      const test = async (data: any) => {
        const fn = () => localfs.write('tree.png', data);
        await expectError(fn, 'Invalid data');
      };

      await test({});
      await test([]);

      await mock.dispose();
    });

    it('throw: timeout', async () => {
      const mock = await TestPrep();
      const localfs = mock.events.fs({ timeout: 10 });
      const data = await fs.readFile('static.test/data.json');

      mock.controller.dispose(); // NB: Kill the controller so the operation times out.

      const fn = () => localfs.write('foo.json', data);
      await expectError(fn, 'timed out after 10 msecs');
      await mock.dispose();
    });

    it('write within "/sub-directory"', async () => {
      const mock = await TestPrep();
      const data = await fs.readFile('static.test/child/tree.png');

      const root = mock.events.fs();
      const subdir = mock.events.fs('images');

      expect(await root.exists('images/foo.png')).to.eql(false);
      await subdir.write('foo.png', data);
      expect(await root.exists('images/foo.png')).to.eql(true);

      await mock.dispose();
    });
  });

  describe('exists', () => {
    it('exists: true', async () => {
      const mock = await TestPrep();
      const localfs = mock.events.fs();
      const src = await fs.readFile('static.test/data.json');
      await localfs.write('foo/bar.json', src);

      const test = async (path: string) => {
        const res = await localfs.exists(path);
        expect(res).to.eql(true);
      };

      await test('foo/bar.json');
      await test('  /foo/bar.json  ');
      await test('  ///foo/bar.json  ');

      await mock.dispose();
    });

    it('exists: false', async () => {
      const mock = await TestPrep();
      const localfs = mock.events.fs();

      const test = async (path: any) => {
        const res = await localfs.exists(path);
        expect(res).to.eql(false);
      };

      await test('foo/bar.json');
      await test('    ');
      await test(null);
      await test({});
      await test([{}]);

      await mock.dispose();
    });

    it('exists within "/sub-directory"', async () => {
      const mock = await TestPrep();
      await mock.copy('static.test/child/tree.png', 'images/tree.png');

      const root = mock.events.fs();
      const subdir = mock.events.fs('images');

      expect(await root.exists('images/tree.png')).to.eql(true);
      expect(await root.exists('tree.png')).to.eql(false);

      expect(await subdir.exists('tree.png')).to.eql(true);
      expect(await subdir.exists('///tree.png')).to.eql(true);
      expect(await subdir.exists('foo.png')).to.eql(false);

      await mock.dispose();
    });
  });
});
