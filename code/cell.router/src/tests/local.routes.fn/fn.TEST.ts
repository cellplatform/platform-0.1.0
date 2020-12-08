import { createMock, expect, Http, t } from '../../test';
import {
  ISampleNodeInValue,
  getManifest,
  prepare,
  ISampleNodeOutValue,
  samples,
  uploadBundle,
} from './util';

describe('/fn:run', function () {
  this.timeout(99999);

  /**
   * Ensure the sample node code as been bundled.
   */
  before(async () => {
    const force = false;
    await samples.node.bundle(force);
  });

  describe('POST (NodeRuntime)', () => {
    const expectFuncResponse = (dir: string | undefined, res: t.IResPostFuncRunResult) => {
      expect(res.ok).to.eql(true);
      expect(res.entry).to.eql('main.js');

      const version = (process.version || '').replace(/^v/, '');
      expect(res.runtime.version).to.eql(`${version}`);
      expect(res.runtime.name).to.eql('node');
      expect(res.size.bytes).to.greaterThan(1000);
      expect(res.size.files).to.greaterThan(1);
      expect(res.errors).to.eql([]);
    };

    it('body: single function - no result', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, samples.node.outdir, bundle);

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
      await uploadBundle(client, samples.node.outdir, bundle);

      const value: ISampleNodeInValue = { value: { foo: 123 } };
      const body: t.IReqPostFuncRunBody = { host, uri, dir, in: { value } };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(json.ok).to.eql(true);
      expectFuncResponse(dir, json.results[0]);

      const result = json.results[0].out.value as ISampleNodeOutValue;
      expect(result.echo).to.eql({ foo: 123 });
      expect(result.process).to.eql({});
    });

    it('body: multiple functions in single payload', async () => {
      const dir = undefined;
      const { mock, bundle, client, http, url } = await prepare({ dir });
      await uploadBundle(client, samples.node.outdir, bundle);

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
      await uploadBundle(client, samples.node.outdir, bundle);

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
      await uploadBundle(client, samples.node.outdir, bundle);

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
      await uploadBundle(client, samples.node.outdir, bundle);

      const value: ISampleNodeInValue = { delay: 20 };
      const body: t.IReqPostFuncRunBody = { host, uri, dir, in: { value }, timeout: 10 };
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
      await uploadBundle(client, samples.node.outdir, bundle);

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
      const { files } = await uploadBundle(client, samples.node.outdir, bundle);
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
      await uploadBundle(client, samples.node.outdir, bundle);

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
      await uploadBundle(client, samples.node.outdir, bundle);

      const value: ISampleNodeInValue = { delay: 20 };
      const body: t.IReqPostFuncRunBody = { host, uri, dir, in: { value } };
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
      await uploadBundle(client, samples.node.outdir, bundle);

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
      await uploadBundle(client, samples.node.outdir, bundle);

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
