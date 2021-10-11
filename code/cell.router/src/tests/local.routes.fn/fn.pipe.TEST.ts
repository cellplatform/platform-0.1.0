import { expect, t } from '../../test';
import { prepare, Samples, uploadBundle, ISamplePipeValue } from './util';

describe('/fn:run (pipes)', function () {
  this.timeout(999999);

  /**
   * Ensure the sample code as been bundled.
   */
  before(async () => {
    const force = false;
    await Samples.pipe.bundle(force);
  });

  describe('[list] - serial execution', () => {
    it('in => out => in => out', async () => {
      const { mock, bundle, client, http, url, manifestUrl } = await prepare();
      await uploadBundle(client, Samples.pipe.outdir, bundle);

      const body: t.IReqPostFuncBody = [
        { bundle: manifestUrl },
        { bundle: manifestUrl },
        { bundle: manifestUrl },
      ];
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFunc;
      await mock.dispose();

      expect(res.ok).to.eql(true);
      expect(json.ok).to.eql(true);
      expect(json.execution).to.eql('serial');

      const results = json.results.map((res) => res.out.value as ISamplePipeValue);
      expect(results[0].count).to.eql(1);
      expect(results[1].count).to.eql(2);
      expect(results[2].count).to.eql(3);
    });

    it('initial input (value / info)', async () => {
      const { mock, bundle, client, http, url, manifestUrl } = await prepare();
      await uploadBundle(client, Samples.pipe.outdir, bundle);

      const input1: t.RuntimeIn<ISamplePipeValue> = {
        value: { count: 99 },
        info: { headers: { contentType: 'foo/bar', contentDef: 'cell:foo:A1' } },
      };

      const input3: t.RuntimeIn<ISamplePipeValue> = {
        info: { headers: { contentType: 'text/html' } },
      };

      const body: t.IReqPostFuncBody = [
        { bundle: manifestUrl, in: input1 },
        { bundle: manifestUrl },
        { bundle: manifestUrl, in: input3 },
      ];

      const res = await http.post(url.query({ json: true }).toString(), body); // NB: {json:true} query flag forces response to JSON even though the headers would otherwise set it to a different mime-type.
      const json = res.json as t.IResPostFunc;
      await mock.dispose();
      expect(json.ok).to.eql(true);

      const results = json.results.map((res) => res.out.value as ISamplePipeValue);
      const info = json.results.map((res) => res.out.info);

      expect(results[0].count).to.eql(100);
      expect(results[1].count).to.eql(101);
      expect(results[2].count).to.eql(102);

      expect(info[0].headers).to.eql({ contentType: 'foo/bar', contentDef: 'cell:foo:A1' });
      expect(info[1].headers).to.eql({ contentType: 'foo/bar', contentDef: 'cell:foo:A1' });
      expect(info[2].headers).to.eql({ contentType: 'text/html' });
    });

    it('merge input: in => out => merged(out|in) => out', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url, manifestUrl } = await prepare({ dir });
      await uploadBundle(client, Samples.pipe.outdir, bundle);

      const input: t.RuntimeIn<ISamplePipeValue> = {
        value: { count: 100, msg: 'hello' },
        info: {},
      };

      const body: t.IReqPostFuncBody = [
        { bundle: manifestUrl },
        { bundle: manifestUrl },
        { bundle: manifestUrl, in: input },
        { bundle: manifestUrl },
      ];
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFunc;
      await mock.dispose();
      expect(json.ok).to.eql(true);

      const results = json.results.map((res) => res.out.value as ISamplePipeValue);

      expect(results[0].count).to.eql(1);
      expect(results[1].count).to.eql(2);
      expect(results[2].count).to.eql(101); // NB: New input merged (overridden from body).
      expect(results[3].count).to.eql(102);

      expect(results[0].msg).to.eql(undefined);
      expect(results[1].msg).to.eql(undefined);
      expect(results[2].msg).to.eql('hello');
      expect(results[3].msg).to.eql('hello');
    });

    it('onError: "stop" (default)', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url, manifestUrl } = await prepare({ dir });
      await uploadBundle(client, Samples.pipe.outdir, bundle);

      const value: ISamplePipeValue = { count: -1 }; // NB: -1 causes error within script.
      const body: t.IReqPostFuncBody = [
        { bundle: manifestUrl },
        { bundle: manifestUrl, in: { value } }, // NB: Fails here.
        { bundle: manifestUrl },
        { bundle: manifestUrl },
        { bundle: manifestUrl },
      ];
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFunc;
      await mock.dispose();
      expect(json.ok).to.eql(false);

      const errors = json.results.map((m) => !m.ok);
      expect(errors.length).to.eql(2);
      expect(errors).to.eql([false, true]); // NB: Fails on second function.
    });

    it('onError: "continue"', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url, manifestUrl } = await prepare({ dir });
      await uploadBundle(client, Samples.pipe.outdir, bundle);

      const value: ISamplePipeValue = { count: -1 }; // NB: -1 causes error within script.
      const body: t.IReqPostFuncBody = [
        { bundle: manifestUrl },
        { bundle: manifestUrl, in: { value } }, // NB: Fails (but continues).
        { bundle: manifestUrl, in: { value }, onError: 'stop' }, // NB: {onError:"continue"} is set for all items via query-string, but overridden and stopped on func here.
        { bundle: manifestUrl },
      ];
      const res = await http.post(url.query({ onError: 'continue' }).toString(), body);
      const json = res.json as t.IResPostFunc;
      await mock.dispose();
      expect(json.ok).to.eql(false);

      const errors = json.results.map((m) => !m.ok);
      expect(errors.length).to.eql(3);

      expect(errors[0]).to.eql(false); //     Success (no errors).
      expect(errors[1]).to.eql(true); //      First fail (execution continues via global {onError:"continue"}).
      expect(errors[2]).to.eql(true); //      Second fail (halts execution via {onError:"stop"} on body item).
      expect(errors[3]).to.eql(undefined); // Execution stopped prior to this item being added.
    });
  });

  describe('{object} - parallel execution', async () => {
    it('runs multiple functions simultaneously', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url, manifestUrl } = await prepare({ dir });
      await uploadBundle(client, Samples.pipe.outdir, bundle);

      const body: t.IReqPostFuncBody = {
        1: { bundle: manifestUrl },
        2: { bundle: manifestUrl },
        3: { bundle: manifestUrl },
      };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFunc;
      await mock.dispose();

      expect(res.ok).to.eql(true);
      expect(json.ok).to.eql(true);
      expect(json.execution).to.eql('parallel');

      const results = json.results.map((res) => res.out.value as ISamplePipeValue);
      expect(results[0].count).to.eql(1);
      expect(results[1].count).to.eql(1);
      expect(results[2].count).to.eql(1);
    });

    it('runs with errors', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url, manifestUrl } = await prepare({ dir });
      await uploadBundle(client, Samples.pipe.outdir, bundle);

      const value: ISamplePipeValue = { count: -1 }; // NB: -1 causes error within script.
      const body: t.IReqPostFuncBody = {
        1: { bundle: manifestUrl },
        2: { bundle: manifestUrl, in: { value } },
        3: { bundle: manifestUrl },
      };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFunc;
      await mock.dispose();

      expect(json.ok).to.eql(false);
      expect(json.results.some((res) => !res.ok)).to.eql(true);
    });
  });
});
