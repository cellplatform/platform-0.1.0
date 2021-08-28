import {
  time,
  expect,
  expectError,
  Hash,
  Path,
  TestFs,
  TestPrep,
  CellAddress,
  HttpClient,
  Uri,
  t,
  stringify,
} from '../test';

const fs = TestFs.node;

describe.only('BusEvents.Fs', function () {
  this.beforeEach(() => TestFs.reset());

  describe('read', () => {
    it('<undefined> (does not exist)', async () => {
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
    it('write: binary file', async () => {
      const mock = await TestPrep();
      const src = await mock.readFile('static.test/child/tree.png');
      const localfs = mock.events.fs();

      const test = async (path: string) => {
        await mock.reset();

        const targetPath = fs.join(mock.rootDir, Path.trim(path));
        const exists = async () => await fs.exists(targetPath);

        expect(await exists()).to.eql(false); // Not yet copied.

        // Write.
        const res = await localfs.write(path, src.data);

        expect(await exists()).to.eql(true); // Exists now.

        const file = (await mock.readFile(targetPath)).data;

        const hash = Hash.sha256(file);
        expect(hash).to.eql(src.hash);
        expect(res.hash).to.eql(hash);
        expect(res.bytes).to.eql(file.byteLength);
      };

      await test('images/tree.png');
      await test('  images/tree.png  ');
      await test('    /images/tree.png   ');

      await mock.dispose();
    });

    it('write: ReadableStream', async () => {
      const mock = await TestPrep();
      const localfs = mock.events.fs();

      const server = await mock.server();
      const src = await mock.readFile('static.test/child/tree.png');

      const address = CellAddress.create(server.host, Uri.create.A1());
      const http = HttpClient.create(address.domain).cell(address.uri);

      const path = 'images/tree.png';
      await http.fs.upload({ filename: path, data: src.data });

      const download = await http.fs.file(path).download();
      const res = await localfs.write(path, download.body);
      await mock.dispose();

      expect(res.hash).to.eql(src.hash);

      const targetPath = fs.join(mock.rootDir, Path.trim(path));
      const file = await mock.readFile(targetPath);
      expect(file.hash).to.eql(res.hash);
      expect(file.data).to.eql(src.data);
    });

    describe('simple types', () => {
      const test = async (data: t.Json, expected: string) => {
        const mock = await TestPrep();
        await mock.reset();

        const path = 'my-file';
        const targetPath = fs.join(mock.rootDir, path);
        const localfs = mock.events.fs();

        expect(await fs.exists(targetPath)).to.eql(false);
        const res = await localfs.write(path, data);
        expect(await fs.exists(targetPath)).to.eql(true);

        await mock.dispose();

        const file = await mock.readFile(targetPath);
        const hash = Hash.sha256(file.data);
        expect(file.hash).to.eql(hash);
        expect(res.hash).to.eql(hash);
        expect(new TextDecoder().decode(file.data)).to.eql(expected);
      };

      it('write: string', async () => {
        await test('hello', 'hello');
      });

      it('write: number', async () => {
        await test(1234, '1234');
      });

      it('write: boolean', async () => {
        await test(true, 'true');
        await test(false, 'false');
      });

      it('write: null', async () => {
        await test(null, 'null');
      });

      it('write: undefined', async () => {
        await test(undefined, 'undefined');
      });

      it('write: JSON [array]', async () => {
        const json = [1, 2, 3];
        await test(json, stringify(json));
      });

      it('write: JSON {object}', async () => {
        const json = { msg: 'hello', count: 123 };
        await test(json, stringify(json));
      });
    });

    it('write: within "/sub-directory"', async () => {
      const mock = await TestPrep();
      const data = await fs.readFile('static.test/child/tree.png');

      const root = mock.events.fs();
      const subdir = mock.events.fs('images');

      expect(await root.exists('images/foo.png')).to.eql(false);
      await subdir.write('foo.png', data);
      expect(await root.exists('images/foo.png')).to.eql(true);

      await mock.dispose();
    });

    it('write: from node-js file buffer', async () => {
      const mock = await TestPrep();
      const localfs = mock.events.fs();
      const data = await fs.readFile('static.test/data.json');

      const path = 'foo/bar.json';
      await localfs.write(path, data);

      const target = await fs.readJson(fs.join(mock.rootDir, path));
      expect(target).to.eql(JSON.parse(data.toString()));

      await mock.dispose();
    });

    describe('errors', () => {
      it('throw: timeout', async () => {
        const mock = await TestPrep();
        const localfs = mock.events.fs({ timeout: 10 });
        const data = await fs.readFile('static.test/data.json');

        mock.controller.dispose(); // NB: Kill the controller so the operation times out.

        const fn = () => localfs.write('foo.json', data);
        await expectError(fn, 'timed out after 10 msecs');
        await mock.dispose();
      });
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

  describe('copy', () => {
    it('copy: binary', async () => {
      const mock = await TestPrep();
      const src = await mock.readFile('static.test/child/tree.png');
      const localfs = mock.events.fs();
      const path = {
        source: 'images/tree.png',
        target: 'images/foo.png',
      };

      await localfs.write(path.source, src.data);

      expect(await localfs.exists(path.target)).to.eql(false); // Not yet copied.
      await localfs.copy(path.source, path.target);
      expect(await localfs.exists(path.target)).to.eql(true);

      await mock.dispose();
    });

    it('copy: "sub/directory"', async () => {
      const mock = await TestPrep();
      const src = await mock.readFile('static.test/child/tree.png');
      const localfs = mock.events.fs('images');

      const path = {
        source: 'tree.png',
        target: 'foo/bar.png',
      };

      await localfs.write(path.source, src.data);
      await localfs.copy(path.source, path.target);

      expect(await localfs.exists(path.target)).to.eql(true);
      expect(await fs.exists(fs.join(mock.rootDir, 'images/foo/bar.png'))).to.eql(true);

      await mock.dispose();
    });
  });

  describe('move', () => {
    it('move: binary', async () => {
      const mock = await TestPrep();
      const src = await mock.readFile('static.test/child/tree.png');
      const localfs = mock.events.fs();
      const path = {
        source: 'images/tree.png',
        target: 'images/foo.png',
      };

      await localfs.write(path.source, src.data);

      expect(await localfs.exists(path.source)).to.eql(true);
      expect(await localfs.exists(path.target)).to.eql(false);

      await localfs.move(path.source, path.target);

      expect(await localfs.exists(path.source)).to.eql(false);
      expect(await localfs.exists(path.target)).to.eql(true);

      await mock.dispose();
    });

    it('move: "sub/directory"', async () => {
      const mock = await TestPrep();
      const src = await mock.readFile('static.test/child/tree.png');
      const localfs = mock.events.fs('images');

      const path = {
        source: 'tree.png',
        target: 'foo/bar.png',
      };

      await localfs.write(path.source, src.data);
      await localfs.move(path.source, path.target);

      expect(await fs.exists(fs.join(mock.rootDir, 'images/tree.png'))).to.eql(false);
      expect(await fs.exists(fs.join(mock.rootDir, 'images/foo/bar.png'))).to.eql(true);

      await mock.dispose();
    });
  });
});
