import { NodeRuntime } from '@platform/cell.runtime/lib/node';
import { readFile, createMock, expect, Http, t, fs, Schema } from '../../test';
import { compile } from '../compiler/compile';

type B = t.RuntimeBundleOrigin;

const createFuncMock = async () => {
  const runtime = NodeRuntime.create();
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

describe('func', function () {
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
    describe('pull', () => {
      const test = async (dir?: string) => {
        const { mock, runtime, bundle, client } = await prepare({ dir });
        expect(await runtime.exists(bundle)).to.eql(false);

        await uploadBundle(client, bundle);
        const res = await runtime.pull(bundle, { silent: true });
        await mock.dispose();

        expect(res.ok).to.eql(true);
        expect(res.errors).to.eql([]);
        expect(res.manifest).to.eql(Schema.urls(mock.host).func.manifest(bundle).toString());
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

      it('empty list', async () => {
        const dir = 'foo';
        const { mock, runtime, bundle } = await prepare({ dir });

        const res = await runtime.pull(bundle, { silent: true });
        const error = res.errors[0];
        await mock.dispose();

        expect(res.ok).to.eql(false);
        expect(res.errors.length).to.eql(1);

        expect(error.type).to.eql('RUNTIME/pull');
        expect(error.message).to.include('contains no files to pull');
        expect(error.bundle).to.eql(bundle);
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

        const res = await runtime.run(bundle, { silent: true });
        expect(await runtime.exists(bundle)).to.eql(true);

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

          const res = await runtime.run(bundle, { silent: true });
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
    it('success', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;

      // TODO 🐷 TEMP addresses
      // const http = Http.create();

      await uploadBundle(client, bundle);

      // mock.
      const data: t.IReqPostFuncBody = { host, uri, dir };
      const res = await http.post(url, data);
      const json = res.json as t.IResPostFunc;

      expect(json.elapsed).to.greaterThan(0);
      expect(json.runtime.name).to.eql('node');
      expect(json.urls.manifest).to.match(/^http:\/\/localhost\:.*index\.json$/);
      expect(json.urls.files).to.include(`filter=${dir}/**`);
      expect(json.size.bytes).to.greaterThan(1000);
      expect(json.size.files).to.greaterThan(1);

      await mock.dispose();
    });

    it('error: bundle does not exist (pull error)', async () => {
      const dir = 'foo';
      const { mock, bundle, http, url } = await prepare({ dir });

      const data: t.IReqPostFuncBody = { ...bundle };
      const res = await http.post(url, data);
      const json = res.json as t.IResPostFunc;
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(500);
      expect(json.errors.length).to.eql(1);

      const error = json.errors[0];
      expect(error.type).to.eql('RUNTIME/pull');
      expect(error.message).to.include('contains no files to pull');
      expect(error.bundle).to.eql(bundle);
    });

    it.skip('TMP', async () => {
      const local8080: B = {
        host: 'localhost:8080',
        uri: 'cell:ckhon6cdk000o6hetdrtmd0dt:A1',
        dir: 'sample',
      };

      const local5000: B = {
        host: 'localhost:5000',
        uri: 'cell:ckhon6cdk000o6hetdrtmd0dt:A1',
        dir: 'sample',
      };

      const local3000: B = {
        host: 'localhost:3000',
        uri: 'cell:ckhon6cdk000o6hetdrtmd0dt:A1',
        dir: 'sample',
      };

      const cloud: B = {
        host: 'dev.db.team',
        uri: 'cell:ckhon6cdk000o6hetdrtmd0dt:A1',
        dir: 'sample',
      };

      // const bundle = local5000;
      // const bundle = local8080;
      const bundle = local3000;
      // const bundle = cloud;

      const http = Http.create();
      const urls = Schema.urls(bundle.host);
      const url = urls.func.base.toString();

      const filesUrl = urls
        .cell(bundle.uri)
        .files.list.query({ filter: `${bundle.dir}/**` })
        .toString();

      console.log('bundle', bundle);
      console.log('filesUrl', filesUrl);
      console.log('-------------------------------------------');

      const data: t.IReqPostFuncBody = { ...bundle };
      const res = await http.post(url, data);
      const json = res.json as t.IResPostFunc;

      console.log('-------------------------------------------');
      console.log('res.status', res.status);
      console.log('res', json);
      console.log('-------------------------------------------');

      json.errors.forEach((error) => {
        const urls = NodeRuntime.urls(error.bundle);
        console.log('error', error);
        console.log('urls', urls);
        console.log('-------------------------------------------');
      });
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
      expect(json.message).to.include('Runtime environment for executing functions not available');
    });
  });
});
