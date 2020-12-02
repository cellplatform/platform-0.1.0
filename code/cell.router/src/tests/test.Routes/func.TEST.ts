import { NodeRuntime } from '@platform/cell.runtime.node';

import { createMock, expect, fs, Http, readFile, Schema, t } from '../../test';
import { compile } from '../compiler/compile';

type B = t.RuntimeBundleOrigin;

async function compileNode(force?: boolean) {
  const dist = fs.resolve('dist/node');
  if (force || !(await fs.pathExists(fs.join(dist, 'main.js')))) {
    await compile.node();
  }
}

const createFuncMock = async () => {
  const runtime = NodeRuntime.create();
  const mock = await createMock({ runtime });
  const http = Http.create();
  const url = mock.urls.fn.run.toString();
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
    await compileNode();
  });

  beforeEach(async () => {
    await fs.remove(fs.resolve('tmp/runtime.node'));
  });

  describe('NodeRuntime', () => {
    describe('pull', () => {
      const test = async (dir?: string) => {
        const { mock, runtime, bundle, client } = await prepare({ dir });
        expect(await runtime.exists(bundle)).to.eql(false);

        await uploadBundle(client, bundle);
        const res = await runtime.pull(bundle, { silent: true });
        await mock.dispose();

        const urls = Schema.urls(mock.host);

        expect(res.ok).to.eql(true);
        expect(res.errors).to.eql([]);
        expect(res.manifest).to.eql(urls.fn.bundle.manifest(bundle).toString());
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
        console.log('test/run :: res', res.ok);
        console.log('TODO', 'return data');
        console.log('TODO', 'params');

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

  describe('NodeRuntime (over http)', () => {
    describe('POST success', () => {
      const expectFuncResponse = (dir: string | undefined, res: t.IResPostFuncRunResult) => {
        expect(res.ok).to.eql(true);

        expect(res.runtime.name).to.eql('node');
        expect(res.urls.manifest).to.match(/^http:\/\/localhost\:.*index\.json$/);
        if (dir) {
          expect(res.urls.files).to.include(`filter=${dir}/**`);
        } else {
          expect(res.urls.files).to.not.eql(`filter=`);
        }
        expect(res.size.bytes).to.greaterThan(1000);
        expect(res.size.files).to.greaterThan(1);
        expect(res.errors).to.eql([]);
      };

      it('body: single function', async () => {
        const dir = 'foo';
        const { mock, bundle, client, http, url } = await prepare({ dir });
        const { host, uri } = bundle;
        await uploadBundle(client, bundle);

        const body: t.IReqPostFuncRunBody = { host, uri, dir };
        const res = await http.post(url, body);
        const json = res.json as t.IResPostFuncRun;
        await mock.dispose();

        expect(json.elapsed).to.greaterThan(0);
        expect(json.results.length).to.eql(1);
        expect(json.results[0].bundle).to.eql(bundle);
        expectFuncResponse(dir, json.results[0]);

        expect(json.results[0].cache.exists).to.eql(false);
        expect(json.results[0].cache.pulled).to.eql(true);
      });

      it('body: multiple functions in single payload', async () => {
        const dir = undefined;
        const { mock, bundle, client, http, url } = await prepare({ dir });
        await uploadBundle(client, bundle);

        const body: t.IReqPostFuncRunBody = [bundle, bundle];
        const res = await http.post(url, body);
        const json = res.json as t.IResPostFuncRun;
        await mock.dispose();

        expect(json.elapsed).to.greaterThan(0);
        expect(json.results.length).to.eql(2);
        expectFuncResponse(dir, json.results[0]);
        expectFuncResponse(dir, json.results[1]);

        // Not cached (initial pull).
        expect(json.results[0].cache.exists).to.eql(false);
        expect(json.results[0].cache.pulled).to.eql(true);

        // Already cached.
        expect(json.results[1].cache.exists).to.eql(true);
        expect(json.results[1].cache.pulled).to.eql(false);
      });

      it('query-string: pull', async () => {
        const dir = 'foo';
        const { mock, bundle, client, http } = await prepare({ dir });
        const { host, uri } = bundle;
        await uploadBundle(client, bundle);

        const url = {
          default: mock.urls.fn.run.toString(),
          pull: mock.urls.fn.run.query({ pull: true }).toString(),
          pullFalse: mock.urls.fn.run.query({ pull: false }).toString(),
        };

        const body: t.IReqPostFuncRunBody = { host, uri, dir };

        const post = async (url: string, body: t.IReqPostFuncRunBody) => {
          const res = await http.post(url, body);
          return res.json as t.IResPostFuncRun;
        };

        const res1 = await post(url.default, body);
        const res2 = await post(url.pull, body);
        const res3 = await post(url.default, body);
        const res4 = await post(url.pullFalse, { ...body, pull: true });

        await mock.dispose();

        expect(res1.results[0].cache.pulled).to.eql(true);
        expect(res2.results[0].cache.pulled).to.eql(true); // NB: Another "Pull" requested in query-string.
        expect(res3.results[0].cache.pulled).to.eql(false); // Default (cached).
        expect(res4.results[0].cache.pulled).to.eql(true); // Overridden in body.
      });

      it('query-string: silent', async () => {
        const dir = 'foo';
        const { mock, bundle, client, http } = await prepare({ dir });
        const { host, uri } = bundle;
        await uploadBundle(client, bundle);

        const url = {
          default: mock.urls.fn.run.toString(),
          silentFalse: mock.urls.fn.run.query({ silent: false }).toString(),
        };

        const body: t.IReqPostFuncRunBody = { host, uri, dir };

        const post = async (url: string, body: t.IReqPostFuncRunBody) => {
          const res = await http.post(url, body);
          return res.json as t.IResPostFuncRun;
        };

        const res1 = await post(url.default, body);
        const res2 = await post(url.silentFalse, body);
        const res3 = await post(url.silentFalse, { ...body, silent: true });

        await mock.dispose();

        expect(res1.results[0].runtime.silent).to.eql(true); // Default
        expect(res2.results[0].runtime.silent).to.eql(false); // via URL.
        expect(res3.results[0].runtime.silent).to.eql(true); // Query-string overridden in body.
      });
    });

    it('error: bundle does not exist (pull error)', async () => {
      const dir = 'foo';
      const { mock, bundle, http, url } = await prepare({ dir });

      const data: t.IReqPostFuncRunBody = { ...bundle };
      const res = await http.post(url, data);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(500);
      expect(json.results[0].errors.length).to.eql(1);

      const error = json.results[0].errors[0];
      expect(error.type).to.eql('RUNTIME/pull');
      expect(error.message).to.include('contains no files to pull');
      expect(error.bundle).to.eql(bundle);
    });

    it('error: func/runtime not provided (500)', async () => {
      const mock = await createMock();
      const url = mock.urls.fn.run.toString();
      const http = Http.create();

      const data: t.IReqPostFuncRunBody = { uri: 'cell:foo:A1' };
      const res = await http.post(url, data);
      const json = res.json as t.IHttpErrorServer;
      await mock.dispose();

      expect(json.status).to.eql(500);
      expect(json.type).to.eql('HTTP/server');
      expect(json.message).to.include('Runtime environment for executing functions not available');
    });
  });
});
