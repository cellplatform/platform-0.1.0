import { expect, t } from '../../test';
import { prepare, samples, uploadBundle, ISamplePipeInValue, ISamplePipeOutValue } from './util';

describe('/fn:run (pipes)', function () {
  this.timeout(99999);

  /**
   * Ensure the sample node code as been bundled.
   */
  before(async () => {
    const force = true;
    await samples.pipe.bundle(force);
  });

  it.skip('pipe: parallel execution - {object}', async () => {
    //
  });

  describe('pipe: seqential execution - [list]', () => {
    it.only('in => out => in => out', async () => {
      const dir = 'foo';
      const { mock, bundle, client, http, url } = await prepare({ dir });
      const { host, uri } = bundle;
      await uploadBundle(client, samples.pipe.outdir, bundle);

      const body: t.IReqPostFuncRunBody = [
        { host, uri, dir },
        { host, uri, dir },
        { host, uri, dir },
      ];
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      expect(json.ok).to.eql(true);

      const results = json.results.map((res) => res.out.value as ISamplePipeOutValue);
      expect(results[0].count).to.eql(1);
      expect(results[1].count).to.eql(2);
      expect(results[2].count).to.eql(3);
    });

    it.skip('merge input: in => out => merged(out|in) => out', async () => {
      //
    });
  });
});
