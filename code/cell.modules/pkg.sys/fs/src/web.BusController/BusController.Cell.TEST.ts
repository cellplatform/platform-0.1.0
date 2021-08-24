import { asArray, expect, Hash, HttpClient, slug, t, TestFs, Uri, CellAddress } from '../test';
import { TestPrep } from './BusController.TEST';

describe('BusController.Cell (Remote)', function () {
  this.timeout(30000);
  this.beforeEach(() => TestFs.reset());

  const fs = TestFs.node;

  const downloadAndVerify = async (
    address: string, // "<domain>/<cell:uri>"
    path: string,
    compareWith: t.SysFsPushedFile,
  ) => {
    const { domain, uri } = CellAddress.parse(address);
    const http = HttpClient.create(domain).cell(uri);
    const download = await http.fs.file(path).download();

    const savePath = fs.resolve(`tmp/verify/${slug()}`);
    const isJson = path.endsWith('.json');
    if (!isJson) await fs.stream.save(savePath, download.body);
    if (isJson) await fs.writeFile(savePath, `${JSON.stringify(download.body, null, '  ')}\n`);

    const saved = await fs.readFile(savePath);
    expect(Hash.sha256(saved)).to.eql(compareWith?.hash, path);
    expect(saved.byteLength).to.eql(compareWith?.bytes, path);
  };

  describe('uri (method)', () => {
    it('remote.cell("address") - "<domain>/<cell:uri>"', async () => {
      const mock = await TestPrep();

      const address = CellAddress.create('domain.org', 'cell:foo:A1');
      const res = mock.events.remote.cell(address.toString());

      expect(res.uri).to.eql(address.uri);
      expect(res.domain).to.eql(address.domain);
      await mock.dispose();
    });

    it('remote.cell("domain", "cell:uri")', async () => {
      const mock = await TestPrep();

      const address = CellAddress.create('domain.org', 'cell:foo:A1');
      const res = mock.events.remote.cell(address.domain, address.uri);

      expect(res.uri).to.eql(address.uri);
      expect(res.domain).to.eql(address.domain);
      await mock.dispose();
    });

    it('throw: invalid "address"', async () => {
      const mock = await TestPrep();
      const err = /Invalid cell address/;

      const fn1 = () => mock.events.remote.cell('foobar');
      expect(fn1).to.throw(err);

      const fn2 = () => mock.events.remote.cell('domain/foobar');
      expect(fn2).to.throw(err);

      const fn3 = () => mock.events.remote.cell('domain', 'foobar');
      expect(fn3).to.throw(err);

      await mock.dispose();
    });
  });

  describe('push (to cell)', () => {
    it('push: single file', async () => {
      const mock = await TestPrep();
      const server = await mock.server();
      const file = await mock.copy('static.test/child/tree.png', 'images/tree.png');

      const address = CellAddress.create(server.host, Uri.create.A1());
      const http = HttpClient.create(address.domain).cell(address.uri);
      const remote = mock.events.remote.cell(address.toString());

      const testExists = async (path: string, exists: boolean) => {
        const res = await http.fs.file(path).exists();
        expect(res).to.eql(exists, path);
      };

      await testExists('images/tree.png', false);
      const res = await remote.push('images/tree.png');
      await testExists('images/tree.png', true);

      expect(res.files.length).to.eql(1);
      expect(res.files[0].path).to.eql(file.path);
      expect(res.files[0].hash).to.eql(file.hash);

      await testExists('images/tree.png', true);
      await downloadAndVerify(address.toString(), 'images/tree.png', res.files[0]);
      await mock.dispose();
    });

    it('push: root directory', async () => {
      const mock = await TestPrep();
      const server = await mock.server();
      const file1 = await mock.copy('static.test/data.json', 'data.json');
      const file2 = await mock.copy('static.test/child/tree.png', 'images/tree.png');
      const file3 = await mock.copy('static.test/child/kitten.jpg', 'images/kitty.jpg');

      const address = CellAddress.create(server.host, Uri.create.A1());
      const http = HttpClient.create(address.domain).cell(address.uri);
      const remote = mock.events.remote.cell(address.toString());

      const testExists = async (path: string, exists: boolean) => {
        const res = await http.fs.file(path).exists();
        expect(res).to.eql(exists, path);
      };

      await testExists('data.json', false);
      await testExists('images/tree.png', false);
      await testExists('images/kitty.jpg', false);

      const res = await remote.push();

      expect(res.errors).to.eql([]);
      expect(res.files.length).to.eql(3);

      await testExists('data.json', true); // NB: Not in the "/images" folder.
      await testExists('images/tree.png', true);
      await testExists('images/kitty.jpg', true);

      await downloadAndVerify(address.toString(), 'data.json', res.files[0]);
      await downloadAndVerify(address.toString(), 'images/kitty.jpg', res.files[1]);
      await downloadAndVerify(address.toString(), 'images/tree.png', res.files[2]);

      await mock.dispose();
    });

    it('push: generate manifest', async () => {
      const mock = await TestPrep();
      const server = await mock.server();
      const file2 = await mock.copy('static.test/child/tree.png', 'images/tree.png');

      const address = CellAddress.create(server.host, Uri.create.A1());
      const http = HttpClient.create(address.domain).cell(address.uri);
      const remote = mock.events.remote.cell(address.toString());

      const testExists = async (path: string, exists: boolean) => {
        const res = await http.fs.file(path).exists();
        expect(res).to.eql(exists, path);
      };

      // Generate directory manifest.
      await mock.events.index.manifest.get({ cachefile: 'index.json', cache: true });

      // Push.
      await testExists('index.json', false);
      await testExists('images/tree.png', false);

      await remote.push();

      await testExists('index.json', true);
      await testExists('images/tree.png', true);

      await mock.dispose();
    });

    it('push: sub-directory', async () => {
      const mock = await TestPrep();
      const server = await mock.server();
      const file1 = await mock.copy('static.test/data.json', 'root.json');
      const file2 = await mock.copy('static.test/child/tree.png', 'images/tree.png');
      const file3 = await mock.copy('static.test/child/kitten.jpg', 'images/kitty.jpg');

      const address = CellAddress.create(server.host, Uri.create.A1());
      const http = HttpClient.create(address.domain).cell(address.uri);
      const remote = mock.events.remote.cell(address.toString());

      const testExists = async (path: string, exists: boolean) => {
        const res = await http.fs.file(path).exists();
        expect(res).to.eql(exists, path);
      };

      await testExists('images/root.json', false);
      await testExists('images/tree.png', false);
      await testExists('images/kitty.jpg', false);

      const res = await remote.push('images/');

      await testExists('images/root.json', false); // NB: Not in the "/images" folder.
      await testExists('images/tree.png', true);
      await testExists('images/kitty.jpg', true);

      expect(res.errors).to.eql([]);
      expect(res.files.length).to.eql(2);
      expect(res.files[0].path).to.eql(file3.path);
      expect(res.files[0].hash).to.eql(file3.hash);
      expect(res.files[1].path).to.eql(file2.path);
      expect(res.files[1].hash).to.eql(file2.hash);

      // Save local and check.
      await downloadAndVerify(address.toString(), 'images/kitty.jpg', res.files[0]);
      await downloadAndVerify(address.toString(), 'images/tree.png', res.files[1]);
      await mock.dispose();
    });

    it('error: source file not found', async () => {
      const mock = await TestPrep();
      const server = await mock.server();

      const address = CellAddress.create(server.host, Uri.create.A1());
      const remote = mock.events.remote.cell(address.toString());

      const test = async (path: string | string[]) => {
        const paths = asArray(path);
        const res = await remote.push(path);

        expect(res.errors.length).to.eql(paths.length);

        for (const error of res.errors) {
          expect(error.code).to.eql('cell/push');
          expect(paths.includes(error.path ?? '')).to.eql(true);
          expect(error.message).to.include('No files to push from source:');
        }
      };

      await test('images/404.png');
      await test(['images/404.png', '404.txt']);
      await mock.dispose();
    });
  });

  describe('pull (from cell)', () => {
    it('pull', async () => {
      const mock = await TestPrep();
      const server = await mock.server();

      const all = [
        '/root.json',
        '/tree.png',
        '/images/tree.png',
        '/images/cat/kitty.jpg',
        '/images/cat/meow.jpg',
        '/images/plant/tree.png',
      ];
      const filterPaths = (...startsWith: string[]) => {
        return all.filter((p) => startsWith.some((math) => p.startsWith(math)));
      };

      const writeLocally = async () => {
        await mock.copy('static.test/data.json', 'root.json');
        await mock.copy('static.test/child/tree.png', 'tree.png');
        await mock.copy('static.test/child/tree.png', 'images/tree.png');
        await mock.copy('static.test/child/kitten.jpg', 'images/cat/kitty.jpg');
        await mock.copy('static.test/child/kitten.jpg', 'images/cat/meow.jpg');
        await mock.copy('static.test/child/tree.png', 'images/plant/tree.png');
      };
      const deleteLocally = () => mock.events.io.delete.fire(all);
      const resetLocally = async () => {
        await deleteLocally();
        await writeLocally();
      };

      const test = async (path: string | string[] | undefined, paths: string[]) => {
        await resetLocally();

        // Setup HTTP client and remote URI address.
        const address = CellAddress.create(server.host, Uri.create.A1());
        const remote = mock.events.remote.cell(address.toString());

        const existsLocally = async (exists: boolean, paths: string[]) => {
          for (let path of paths) {
            if (!path.startsWith('/')) path = `/${path}`;
            const res = await mock.events.io.info.get({ path });
            const file = res.files.find((item) => item.path === path);
            expect(file?.exists).to.eql(exists, path);
          }
        };

        // Push files to the remote cell.
        await remote.push();
        await existsLocally(true, paths);

        // Delete locally.
        await mock.events.io.delete.fire(paths);

        // Pull them back from the remote cell.
        await existsLocally(false, paths);
        const res = await remote.pull(path);
        await existsLocally(true, paths); // NB: Files have been re-downloaded (aka. "pulled").

        expect(res.errors).to.eql([]);
        expect(res.files.length).to.eql(paths.length);

        const responsePaths = res.files.map((file) => file.path);
        await existsLocally(true, responsePaths); // NB: Test local download via the returned file-path.
      };

      // Root directory.
      await test(undefined, all);
      await test('', all);
      await test('  /  ', all);
      await test('  ', all);
      await test([''], all);
      await test([], all);
      await test(['/'], all);
      await test(['/', '  ', '  /  '], all);
      await test('**/*', all);

      // Sub-directory.
      await test('images/', filterPaths('/images/'));
      await test('/images/', filterPaths('/images/'));
      await test('images/**/*', filterPaths('/images/'));
      await test(['images/'], filterPaths('/images/'));
      await test(['images/**/*'], filterPaths('/images/'));
      await test(['images/', '/images/', '   /images/  '], filterPaths('/images/'));

      // Multi-folder.
      await test([' /images/cat/ ', 'images/plant/'], filterPaths('/images/cat', '/images/plant'));

      // Specific file(s).
      await test('/root.json', ['/root.json']);
      await test('/*', ['/root.json', '/tree.png']);
      await test('**/tree.*', ['/tree.png', '/images/tree.png', '/images/plant/tree.png']);

      // No match
      await test('/*.txt', []);
      await test('*.txt', []);

      await mock.dispose();
    });
  });
});
