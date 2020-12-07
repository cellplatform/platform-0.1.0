import { NodeRuntime } from '@platform/cell.runtime.node';
import { createMock, expect, fs, Http, readFile, t } from '../../test';
import { samples } from '../test.cell.runtime.node/NodeRuntime.TEST';
import { EntryParams, Result } from '../test.cell.runtime.node/sample.NodeRuntime/types';

type B = t.RuntimeBundleOrigin;

const createFuncMock = async () => {
  const runtime = NodeRuntime.create();
  const mock = await createMock({ runtime });
  const http = Http.create();
  const url = mock.urls.fn.run;
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

const getManifest = (files: t.IHttpClientCellFileUpload[]) => {
  const file = files.find((f) => f.filename.endsWith('index.json'));
  const json = JSON.parse(file?.data.toString() || '');
  return json as t.BundleManifest;
};

const uploadBundle = async (
  client: t.IHttpClientCell,
  bundle: B,
  options: { filter?: (file: t.IHttpClientCellFileUpload) => boolean } = {},
) => {
  const { filter } = options;
  let files = await bundleToFiles(samples.node.outdir, bundle.dir);
  files = filter ? files.filter((file) => filter(file)) : files;
  const upload = await client.files.upload(files);
  expect(upload.ok).to.eql(true);
  return { files, upload, bundle };
};

describe('/fn:run (NodeRuntime over HTTP)', function () {
  this.timeout(99999);

  /**
   * Ensure the sample node code as been bundled.
   */
  before(async () => {
    const force = false;
    await Promise.all([
      await samples.node.bundle(force),
      await samples.math.bundle(force),
      //
    ]);
  });
  beforeEach(() => fs.remove(fs.resolve('tmp/runtime.node')));

  describe.only('POST success', () => {
    const expectFuncResponse = (dir: string | undefined, res: t.IResPostFuncRunResult) => {
      expect(res.ok).to.eql(true);
      expect(res.entry).to.eql('main.js');

      const version = (process.version || '').replace(/^v/, '');
      expect(res.runtime.version).to.eql(`${version}`);
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

    it('body: single function - no result', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, bundle);

      const body: t.IReqPostFuncRunBody = { host, uri, dir };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(json.ok).to.eql(true);

      expect(json.elapsed.prep).to.greaterThan(0);
      expect(json.elapsed.run).to.greaterThan(10);
      expect(json.results.length).to.eql(1);
      expect(json.results[0].bundle).to.eql(bundle);
      expectFuncResponse(dir, json.results[0]);

      expect(json.results[0].cache.exists).to.eql(false);
      expect(json.results[0].cache.pulled).to.eql(true);
    });

    it('body: single function - result (pass params)', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, bundle);

      const params: EntryParams = { value: { foo: 123 } };
      const body: t.IReqPostFuncRunBody = { host, uri, dir, in: { params } };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(json.ok).to.eql(true);
      expectFuncResponse(dir, json.results[0]);

      const result = json.results[0].result as Result;
      expect(result.echo).to.eql({ foo: 123 });
      expect(result.process).to.eql({});
    });

    it('body: multiple functions in single payload', async () => {
      const dir = undefined;
      const { mock, bundle, client, http, url } = await prepare({ dir });
      await uploadBundle(client, bundle);

      const body: t.IReqPostFuncRunBody = [bundle, bundle];
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(json.ok).to.eql(true);
      expect(json.elapsed.prep).to.greaterThan(0);
      expect(json.elapsed.run).to.greaterThan(0);
      expect(json.results.length).to.eql(2);
      expectFuncResponse(dir, json.results[0]);
      expectFuncResponse(dir, json.results[1]);

      // Not cached (initial pull).
      expect(json.results[0].cache.exists).to.eql(false);
      expect(json.results[0].cache.pulled).to.eql(true);

      // Already cached.
      expect(json.results[1].cache.exists).to.eql(true);
      expect(json.results[1].cache.pulled).to.eql(false);

      // Second time faster (pulled and compiled).
      expect(json.results[0].elapsed.prep).to.greaterThan(json.results[1].elapsed.prep);
    });

    it('tx: generated', async () => {
      const { mock, bundle, client, http, url } = await prepare({});
      const { host, uri } = bundle;
      await uploadBundle(client, bundle);

      const body: t.IReqPostFuncRunBody = { host, uri };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(body.tx).to.eql(undefined);
      expect(json.results[0].tx.length).to.greaterThan(15);
    });

    it('tx: specified', async () => {
      const { mock, bundle, client, http, url } = await prepare({});
      const { host, uri } = bundle;
      await uploadBundle(client, bundle);

      const tx = 'my-execution-id';
      const body: t.IReqPostFuncRunBody = { host, uri, tx };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(json.results[0].tx).to.eql(tx);
    });

    it('timeout: on body payload', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, bundle);

      const params: EntryParams = { delay: 20 };
      const body: t.IReqPostFuncRunBody = { host, uri, dir, in: { params }, timeout: 10 };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(json.ok).to.eql(false);

      const result = json.results[0];
      expect(result.errors.length).to.eql(1);

      const error = result.errors[0];
      expect(error.type).to.eql('RUNTIME/run');
      expect(error.bundle).to.eql(bundle);
      expect(error.message).to.include('Execution timed out (max 10ms)');
    });

    it('custom entry path', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, bundle);

      const entry = '  //dev.js  '; // NB: whitespace is removed and "/" trimmed.

      const body: t.IReqPostFuncRunBody = { host, uri, dir, entry };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(res.ok).to.eql(true);
      expect(json.ok).to.eql(true);
      expect(json.results[0].entry).to.eql('dev.js');
    });

    it('hash: valid', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      const { files } = await uploadBundle(client, bundle);
      const manifest = getManifest(files);

      const hash = manifest.hash;
      expect(hash).to.not.eql(undefined);

      const body: t.IReqPostFuncRunBody = { host, uri, dir, hash };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(res.ok).to.eql(true);
      expect(json.ok).to.eql(true);
    });

    it('hash: invvalid', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, bundle);

      const hash = 'sha256-fail';
      const body: t.IReqPostFuncRunBody = { host, uri, dir, hash };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(json.ok).to.eql(false);

      const result = json.results[0];
      expect(result.errors.length).to.eql(1);

      const error = result.errors[0];
      expect(error.type).to.eql('RUNTIME/run');
      expect(error.bundle).to.eql(bundle);
      expect(error.message).to.include('Bundle manifest does not match requested hash');
      expect(error.message).to.include(hash);
    });

    it('timeout: on query-string', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, bundle);

      const params: EntryParams = { delay: 20 };
      const body: t.IReqPostFuncRunBody = { host, uri, dir, in: { params } };
      const res = await http.post(url.query({ timeout: 10 }).toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      const result = json.results[0];
      expect(result.errors.length).to.eql(1);

      const error = result.errors[0];
      expect(error.type).to.eql('RUNTIME/run');
      expect(error.bundle).to.eql(bundle);
      expect(error.message).to.include('Execution timed out (max 10ms)');
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

  describe('errors', () => {
    it('error: bundle does not exist (pull error)', async () => {
      const dir = 'foo';
      const { mock, bundle, http, url } = await prepare({ dir });

      const data: t.IReqPostFuncRunBody = { ...bundle };
      const res = await http.post(url.toString(), data);
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
