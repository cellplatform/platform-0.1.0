import { t } from '../../test';
import { prepare, samples, uploadBundle } from './util';

describe('/fn:run (pipe)', function () {
  this.timeout(99999);

  /**
   * Ensure the sample node code as been bundled.
   */
  before(async () => {
    const force = false;
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
      await uploadBundle(client, bundle);

      const body: t.IReqPostFuncRunBody = [
        { host, uri, dir },
        { host, uri, dir },
      ];
      const res = await http.post(url.toString(), body);
      const json = res.json as t.IResPostFuncRun;
      await mock.dispose();

      console.log('-------------------------------------------');
      console.log('json', json);
    });

    it.skip('merge input: in => out => merged(out|in) => out', async () => {
      //
    });
  });
});
