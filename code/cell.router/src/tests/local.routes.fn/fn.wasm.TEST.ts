import { expect, t } from '../../test';
import { prepare, samples, uploadBundle } from './util';

describe('/fn:run (WASM)', function () {
  this.timeout(999999);

  /**
   * Ensure the sample code as been bundled.
   */
  before(async () => {
    const force = false;
    await samples.node.bundle(force);
  });

  it('run wasm', async () => {
    const dir = 'foo';
    const { mock, bundle, client, http, url } = await prepare({ dir });
    const { host, uri } = bundle;
    await uploadBundle(client, samples.node.outdir, bundle);

    const entry = 'wasm.js';
    const body: t.IReqPostFuncBody = [
      { host, uri, dir, entry },
      { host, uri, dir, entry, in: { value: { count: 123 } } },
      { host, uri, dir, entry },
    ];
    const res = await http.post(url.toString(), body);
    const json = res.json as t.IResPostFunc;
    await mock.dispose();

    const results = json.results
      .map((res) => res.out.value as { count: number })
      .map((res) => res.count);

    // NB: The sample script adds to a number (via a WASM module).
    expect(results[0]).to.eql(10);
    expect(results[1]).to.eql(133);
    expect(results[2]).to.eql(143);
  });
});
