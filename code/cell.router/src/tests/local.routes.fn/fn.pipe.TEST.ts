import { expect, t } from '../../test';
import { prepare, samples, uploadBundle, ISamplePipeValue } from './util';

describe.only('/fn:run (pipes)', function () {
  this.timeout(99999);

  /**
   * Ensure the sample node code as been bundled.
   */
  before(async () => {
    const force = false;
    await samples.pipe.bundle(force);
  });

  describe('[list] - seqential execution', () => {
    it('in => out => in => out', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, samples.pipe.outdir, bundle);

      const body: t.IReqPostFuncSet = [
        { host, uri, dir },
        { host, uri, dir },
        { host, uri, dir },
      ];
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFunc;
      await mock.dispose();
      expect(json.ok).to.eql(true);

      const results = json.results.map((res) => res.out.value as ISamplePipeValue);
      expect(results[0].count).to.eql(1);
      expect(results[1].count).to.eql(2);
      expect(results[2].count).to.eql(3);
    });

    it('initial input (value / info)', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, samples.pipe.outdir, bundle);

      const input1: t.RuntimeIn<ISamplePipeValue> = {
        value: { count: 99 },
        info: { headers: { contentType: 'foo/bar', contentDef: 'cell:foo:A1' } },
      };

      const input3: t.RuntimeIn<ISamplePipeValue> = {
        info: { headers: { contentType: 'text/html' } },
      };

      const body: t.IReqPostFuncSet = [
        { host, uri, dir, in: input1 },
        { host, uri, dir },
        { host, uri, dir, in: input3 },
      ];
      const res = await http.post(url.toString(), body);
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
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, samples.pipe.outdir, bundle);

      const input: t.RuntimeIn<ISamplePipeValue> = {
        value: { count: 100, msg: 'hello' },
        info: {},
      };

      const body: t.IReqPostFuncSet = [
        { host, uri, dir },
        { host, uri, dir },
        { host, uri, dir, in: input },
        { host, uri, dir },
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

    it.skip('error within pipe', async () => {
      /**
       * TODO 🐷
       * onError: 'stop' (default) | 'continue'
       */
    });
  });

  describe.only('{object} - parallel execution', async () => {
    it('runs multiple functions simultaneously', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, samples.pipe.outdir, bundle);

      const body: t.IReqPostFuncSet = {
        1: { host, uri, dir },
        2: { host, uri, dir },
        3: { host, uri, dir },
      };
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFunc;
      await mock.dispose();

      expect(res.ok).to.eql(true);
      expect(json.ok).to.eql(true);

      const results = json.results.map((res) => res.out.value as ISamplePipeValue);
      expect(results[0].count).to.eql(1);
      expect(results[1].count).to.eql(1);
      expect(results[2].count).to.eql(1);
    });
  });
});
