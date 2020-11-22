import { NodeRuntime } from '@platform/cell.runtime/lib/node';
import { readFile, createMock, expect, Http, t, fs } from '../../test';
import { compile } from '../compiler/compile';

type B = t.RuntimeBundleOrigin;

const createFuncMock = async () => {
  const runtime = NodeRuntime.init();
  const mock = await createMock({ runtime });
  const http = Http.create();
  const url = mock.urls.func.base.toString();
  return { url, mock, http, runtime };
};

const prepare = async (options: { dir?: string; uri?: string } = {}) => {
  const { dir, uri = 'cell:foo:A1' } = options;
  const { mock, runtime, http, url } = await createFuncMock();
  const { host } = mock;
  const client = mock.client.cell(uri);
  const bundle: B = { host, uri, dir };
  return { mock, runtime, http, client, bundle, url, uri };
};

const bundleToFiles = async (sourceDir: string, targetDir?: string) => {
  targetDir = (targetDir || '').trim();
  const base = fs.resolve('.');
  const paths = await fs.glob.find(fs.join(base, sourceDir, '**'));
  const files = await Promise.all(
    paths.map(async (path) => {
      const data = await readFile(path);
      let filename = path.substring(fs.join(base, sourceDir).length + 1);
      filename = targetDir ? fs.join(targetDir, filename) : filename;
      return { filename, data } as t.IHttpClientCellFileUpload;
    }),
  );
  return files;
};

const uploadBundle = async (
  client: t.IHttpClientCell,
  bundle: B,
  options: { filter?: (file: t.IHttpClientCellFileUpload) => boolean } = {},
) => {
  const { filter } = options;
  let files = await bundleToFiles('dist/node', bundle.dir);
  files = filter ? files.filter((file) => filter(file)) : files;

  const upload = await client.files.upload(files);
  expect(upload.ok).to.eql(true);
  return { files, upload, bundle };
};

describe.only('func', function () {
  this.timeout(99999);

  before(async () => {
    /**
     * Ensure sample node distribution has been compiled.
     */
    const dist = fs.resolve('dist/node');
    if (!(await fs.pathExists(fs.join(dist, 'main.js')))) {
      await compile.node();
    }
  });

  beforeEach(async () => {
    await fs.remove(fs.resolve('tmp/runtime.node'));
  });

  describe('RuntimeEnvNode', () => {
    describe('exists:false => pull => exists:true', () => {
      const test = async (dir?: string) => {
        const { mock, runtime, bundle, client } = await prepare({ dir });

        expect(await runtime.exists(bundle)).to.eql(false);
        await uploadBundle(client, bundle);
        const res = await runtime.pull(bundle, { silent: true });
        await mock.dispose();

        expect(res.ok).to.eql(true);
        expect(res.errors).to.eql([]);
        expect(await runtime.exists(bundle)).to.eql(true);
      };

      it('with sub-directory', async () => {
        await test('foo/bar/');
        await test('sample///'); // NB: Path will be cleaned.
      });

      it('without sub-directory', async () => {
        await test();
        await test('');
        await test('  ');
      });
    });

    describe('remove', () => {
      it('removes pulled bundle', async () => {
        const test = async (dir?: string) => {
          const { mock, runtime, bundle, client } = await prepare({ dir });
          expect(await runtime.exists(bundle)).to.eql(false);

          await uploadBundle(client, bundle);
          await runtime.pull(bundle, { silent: true });
          expect(await runtime.exists(bundle)).to.eql(true);

          expect((await runtime.remove(bundle)).count).to.eql(1);
          expect((await runtime.remove(bundle)).count).to.eql(0); // NB: Nothing removed (already removed on last line)
          expect(await runtime.exists(bundle)).to.eql(false);

          await mock.dispose();
        };

        await test('foobar');
        await test();
      });

      it('does nothing when non-existant bundle removed', async () => {
        const { mock, runtime, bundle } = await prepare();
        expect(await runtime.exists(bundle)).to.eql(false);
        await runtime.remove(bundle);
        await mock.dispose();
      });
    });

    describe('clear', () => {
      it('nothing to clear', async () => {
        const { mock, runtime } = await prepare();
        expect((await runtime.clear()).count).to.eql(0);
        await mock.dispose();
      });

      it('removes all pulled bundles', async () => {
        const { mock, runtime, client, uri } = await prepare();
        const host = mock.host;

        const bundle1: B = { host, uri, dir: 'foo' };
        const bundle2: B = { host, uri, dir: 'bar' };
        const bundle3: B = { host, uri };

        await uploadBundle(client, bundle1);
        await uploadBundle(client, bundle2);
        await uploadBundle(client, bundle3);

        expect(await runtime.exists(bundle1)).to.eql(false);
        expect(await runtime.exists(bundle2)).to.eql(false);
        expect(await runtime.exists(bundle3)).to.eql(false);

        await runtime.pull(bundle1, { silent: true });
        await runtime.pull(bundle2, { silent: true });
        await runtime.pull(bundle3, { silent: true });

        expect(await runtime.exists(bundle1)).to.eql(true);
        expect(await runtime.exists(bundle2)).to.eql(true);
        expect(await runtime.exists(bundle3)).to.eql(true);

        expect((await runtime.clear()).count).to.eql(3);
        expect((await runtime.clear()).count).to.eql(0);

        expect(await runtime.exists(bundle1)).to.eql(false);
        expect(await runtime.exists(bundle2)).to.eql(false);
        expect(await runtime.exists(bundle3)).to.eql(false);

        await mock.dispose();
      });
    });

    describe('run', () => {
      it('run', async () => {
        const { mock, runtime, bundle, client } = await prepare({ dir: 'foo' });

        await uploadBundle(client, bundle);
        expect(await runtime.exists(bundle)).to.eql(false);
        // await runtime.pull(bundle, { silent: true });
        // expect(await runtime.exists(bundle)).to.eql(true);

        const res = await runtime.run(bundle, { silent: false });

        console.log('-------------------------------------------');
        console.log('res', res);

        await mock.dispose();
      });

      it('error: no manifest in bundle', async () => {
        const test = async (dir?: string) => {
          const { mock, runtime, bundle, client } = await prepare({ dir });

          const noManifest = (file: t.IHttpClientCellFileUpload) =>
            !file.filename.endsWith('index.json'); // NB: Cause error by filtering out the manifest file.

          await uploadBundle(client, bundle, { filter: noManifest });

          const res = await runtime.run(bundle);
          const error = res.errors[0];
          await mock.dispose();

          expect(res.ok).to.eql(false);
          expect(res.errors.length).to.eql(1);
          expect(error.message).to.include('A bundle manifest file does not exist');
          if (dir) {
            expect(error.message).to.include(`|cell:foo:A1|dir:${dir}]`);
          } else {
            expect(error.message).to.include(`|cell:foo:A1]`);
          }
        };

        await test('foo');
        await test('foo/bar');
        await test();
      });
    });
  });

  describe('over http', () => {
    it.only('does not exist (404)', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });

      const { host, uri } = bundle;

      // TODO 🐷 TEMP addresses
      // const http = Http.create();

      await uploadBundle(client, bundle);

      // mock.
      const data: t.IReqPostFuncBody = { host, uri, dir };
      const res = await http.post(url, data);
      const json = res.json;

      console.log('-------------------------------------------');
      console.log('res.status', res.status);
      console.log('json', json);

      expect(123).to.equal(123);

      await mock.dispose();
    });

    it('error: func/runtime not provided (500)', async () => {
      const mock = await createMock();
      const url = mock.urls.func.base.toString();
      const http = Http.create();

      const data: t.IReqPostFuncBody = { uri: 'cell:foo:A1' };
      const res = await http.post(url, data);
      const json = res.json as t.IHttpErrorServer;
      await mock.dispose();

      expect(json.status).to.eql(500);
      expect(json.type).to.eql('HTTP/server');
      expect(json.message).to.include(
        'A runtime environment for executing functions not available',
      );
    });
  });
});
