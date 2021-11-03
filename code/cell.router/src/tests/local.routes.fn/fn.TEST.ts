import { expect, t } from '../../test';
import {
  getManifest,
  ISampleNodeInValue,
  ISampleNodeOutValue,
  prepare,
  Samples,
  uploadBundle,
} from './util';

describe('/fn:run', function () {
  this.timeout(999999);

  /**
   * Ensure the sample node code as been bundled.
   */
  before(async () => {
    const force = false;
    await Samples.node.bundle(force);
  });

  describe('POST (NodeRuntime)', () => {
    describe('run ', () => {
      const expectFuncResponse = (res: t.IResPostFuncResult) => {
        expect(res.ok).to.eql(true);
        expect(res.entry).to.eql('main.js');
        expect(res.size.bytes).to.greaterThan(1000);
        expect(res.size.files).to.greaterThan(1);
        expect(res.errors).to.eql([]);
        expect(res.bundle.version.split('.').length).to.eql(3); // NB: semver.
        expect(res.bundle.fileshash).to.match(/^sha256-/);
        expect(res.bundle.url).to.match(/^http\:/);
        expect(res.bundle.url).to.match(/index\.json$/);
      };

      it('single function - no result', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare();
        const { files } = await uploadBundle(client, Samples.node.outdir, bundle);
        const manifest = getManifest(files);

        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl }];
        const res = await http.post(url.toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        expect(json.ok).to.eql(true);

        expect(json.elapsed).to.greaterThan(10);
        expect(json.results.length).to.eql(1);

        expect(json.results[0].bundle.url).to.eql(manifestUrl);
        expect(json.results[0].bundle.fileshash).to.eql(manifest.hash.files);

        const version = (process.version || '').replace(/^v/, '');
        expect(json.runtime.version).to.eql(`node@${version}`);
        expect(json.runtime.name).to.eql('cell.runtime.node');

        expectFuncResponse(json.results[0]);

        expect(json.results[0].cache.exists).to.eql(false);
        expect(json.results[0].cache.pulled).to.eql(true);
      });

      it('single function - result (pass params)', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare();
        await uploadBundle(client, Samples.node.outdir, bundle);

        const value: ISampleNodeInValue = { value: { foo: 123 } };
        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl, in: { value } }];
        const res = await http.post(url.toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        expect(json.ok).to.eql(true);
        expectFuncResponse(json.results[0]);

        const result = json.results[0].out.value as ISampleNodeOutValue;
        expect(result.echo).to.eql({ foo: 123 });
        expect(result.process).to.eql({});
      });

      it('multiple functions in single payload', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare();
        await uploadBundle(client, Samples.node.outdir, bundle);

        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl }, { bundle: manifestUrl }];
        const res = await http.post(url.toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        expect(json.ok).to.eql(true);
        expect(json.elapsed).to.greaterThan(0);
        expect(json.results.length).to.eql(2);
        expectFuncResponse(json.results[0]);
        expectFuncResponse(json.results[1]);

        // Not cached (initial pull).
        expect(json.results[0].cache.exists).to.eql(false);
        expect(json.results[0].cache.pulled).to.eql(true);

        // Already cached.
        expect(json.results[1].cache.exists).to.eql(true);
        expect(json.results[1].cache.pulled).to.eql(false);

        // Second time faster (pulled and compiled).
        expect(json.results[0].elapsed.prep).to.greaterThan(json.results[1].elapsed.prep);
      });
    });

    describe('tx (transaction id)', () => {
      it('tx: generated', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare({});
        await uploadBundle(client, Samples.node.outdir, bundle);

        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl }];
        const res = await http.post(url.toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        expect(body[0].tx).to.eql(undefined);
        expect(json.results[0].tx.length).to.greaterThan(15);
      });

      it('tx: specified', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare({});
        await uploadBundle(client, Samples.node.outdir, bundle);

        const tx = 'my-execution-id';
        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl, tx }];
        const res = await http.post(url.toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        expect(json.results[0].tx).to.eql(tx);
      });
    });

    describe('entry ("path")', () => {
      it('default entry path', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare();
        await uploadBundle(client, Samples.node.outdir, bundle);

        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl }];
        const res = await http.post(url.toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        expect(json.ok).to.eql(true);
        expect(json.results[0].entry).to.eql('main.js');
      });

      it('custom entry path', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare();
        await uploadBundle(client, Samples.node.outdir, bundle);

        const entry = '  //dev.js  '; // NB: whitespace is removed and leading "/" is trimmed.

        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl, entry }];
        const res = await http.post(url.toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        expect(res.ok).to.eql(true);
        expect(json.ok).to.eql(true);
        expect(json.results[0].entry).to.eql('dev.js');
      });

      it('error: path does not exist', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare();
        await uploadBundle(client, Samples.node.outdir, bundle);

        const entry = '404.js';
        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl, entry }];
        const res = await http.post(url.toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        expect(res.ok).to.eql(false);
        expect(json.ok).to.eql(false);

        const result = json.results[0];
        const errors = result.errors;

        expect(result.ok).to.eql(false);
        expect(errors[0].message).to.include(`Entry file does not exist '404.js'`);
      });
    });

    describe('bundle verification ("fileshash")', () => {
      it('hash: valid', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare();
        const { files } = await uploadBundle(client, Samples.node.outdir, bundle);
        const manifest = getManifest(files);

        const fileshash = manifest.hash.files;
        expect(fileshash).to.not.eql(undefined);

        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl, fileshash }];
        const res = await http.post(url.toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        expect(res.ok).to.eql(true);
        expect(json.ok).to.eql(true);
      });

      it('hash: invalid', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare();
        const { files } = await uploadBundle(client, Samples.node.outdir, bundle);
        const manifest = getManifest(files);

        const fileshash = 'sha256-no-exist';
        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl, fileshash }];
        const res = await http.post(url.toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        expect(res.ok).to.eql(false);
        expect(json.ok).to.eql(false);

        const result = json.results[0];
        expect(result.bundle.fileshash).to.eql(manifest.hash.files);
        expect(result.errors.length).to.eql(1);

        const error = result.errors[0];
        expect(error.type).to.eql('RUNTIME/run');
        expect(error.bundle.url).to.eql(manifestUrl);
        expect(error.message).to.include('Bundle manifest does not match requested fileshash');
        expect(error.message).to.include(fileshash);
      });
    });

    describe('timeout', () => {
      it('timeout: on body payload', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare();
        await uploadBundle(client, Samples.node.outdir, bundle);

        const value: ISampleNodeInValue = { delay: 50 };
        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl, in: { value }, timeout: 10 }];
        const res = await http.post(url.toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        expect(json.ok).to.eql(false);

        const result = json.results[0];
        expect(result.errors.length).to.eql(1);

        const error = result.errors[0];
        expect(error.type).to.eql('RUNTIME/run');

        expect(error.bundle.url).to.eql(manifestUrl);
        expect(error.message).to.include('Execution timed out (max 10ms)');
      });

      it('timeout: on query-string', async () => {
        const { mock, bundle, client, http, url, manifestUrl } = await prepare();
        await uploadBundle(client, Samples.node.outdir, bundle);

        const value: ISampleNodeInValue = { delay: 50 };
        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl, in: { value } }];
        const res = await http.post(url.query({ timeout: 10 }).toString(), body);
        const json = res.json as t.IResPostFunc;
        await mock.dispose();

        const result = json.results[0];
        expect(result.errors.length).to.eql(1);

        const error = result.errors[0];
        expect(error.type).to.eql('RUNTIME/run');
        expect(error.bundle.url).to.eql(manifestUrl);
        expect(error.message).to.include('Execution timed out (max 10ms)');
      });
    });

    describe('query string (flags)', () => {
      it('query-string: pull', async () => {
        const { mock, bundle, client, http, manifestUrl } = await prepare();
        await uploadBundle(client, Samples.node.outdir, bundle);

        const url = {
          default: mock.urls.fn.run.toString(),
          pull: mock.urls.fn.run.query({ pull: true }).toString(),
          pullFalse: mock.urls.fn.run.query({ pull: false }).toString(),
        };

        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl }];

        const post = async (url: string, body: t.IReqPostFuncBody) => {
          const res = await http.post(url, body);
          return res.json as t.IResPostFunc;
        };

        const res1 = await post(url.default, body);
        const res2 = await post(url.pull, body);
        const res3 = await post(url.default, body);
        const res4 = await post(url.pullFalse, [{ ...body[0], pull: true }]);

        await mock.dispose();

        expect(res1.results[0].cache.pulled).to.eql(true);
        expect(res2.results[0].cache.pulled).to.eql(true); // NB: Another "Pull" requested in query-string.
        expect(res3.results[0].cache.pulled).to.eql(false); // Default (cached).
        expect(res4.results[0].cache.pulled).to.eql(true); // Overridden in body.
      });

      it('query-string: silent', async () => {
        const log = console.log;
        console.log = () => null; // NB: Suppress standard console output (to keep tests looking clean).

        const { mock, bundle, client, http, manifestUrl } = await prepare();
        await uploadBundle(client, Samples.node.outdir, bundle);

        const url = {
          default: mock.urls.fn.run.toString(),
          silentFalse: mock.urls.fn.run.query({ silent: false }).toString(),
        };

        const body: t.IReqPostFuncBody = [{ bundle: manifestUrl }];

        const post = async (url: string, body: t.IReqPostFuncBody) => {
          const res = await http.post(url, body);
          return res.json as t.IResPostFunc;
        };

        const res1 = await post(url.default, body);
        const res2 = await post(url.silentFalse, body);
        const res3 = await post(url.silentFalse, [{ ...body[0], silent: true }]);

        console.log = log;
        await mock.dispose();

        expect(res1.results[0].silent).to.eql(true); // Default
        expect(res2.results[0].silent).to.eql(false); // via URL.
        expect(res3.results[0].silent).to.eql(true); // Query-string overridden in body.

        return;
      });
    });
  });

  describe('errors', () => {
    it('error: bundle does not exist (pull error)', async () => {
      const dir = 'foo';
      const { mock, http, url, manifestUrl } = await prepare({ dir });

      const data: t.IReqPostFuncBody = [{ bundle: manifestUrl }];
      const res = await http.post(url.toString(), data);
      const json = res.json as t.IResPostFunc;
      await mock.dispose();

      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(500);
      expect(json.results[0].errors.length).to.eql(1);

      const error = json.results[0].errors[0];
      expect(error.type).to.eql('RUNTIME/pull');
      expect(error.message).to.include('[404] Failed to retrieve bundle manifest');
      expect(error.bundle.url).to.eql(manifestUrl);
    });
  });
});
