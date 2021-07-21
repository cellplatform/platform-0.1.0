import { t } from '../common';
import { NodeRuntime } from '@platform/cell.runtime.node';
import { HttpClient, Schema } from '@platform/cell.client';
import { http } from '@platform/http';

describe.skip('Main', function () {
  this.timeout(99999);

  it('tmp', async () => {
    //
    type B = t.RuntimeBundleOrigin;

    const runtime = NodeRuntime.create();

    const bundle: B = {
      host: 'localhost:5000',
      uri: 'cell:ckrb6n1kc0008bmetb35le9fn:A1',
      dir: 'sys.scratchpad.node',
    };

    const res1 = await runtime.run(bundle, { silent: false, pull: true });
    const res2 = await runtime.run(bundle, { silent: false });

    console.log('-------------------------------------------');
    console.log('res', res1);
    console.log('res2', res2.out);
  });

  it('tmp.url', async () => {
    const host = 'localhost:5000';
    const urls = Schema.urls(host);

    const uri = 'cell:ckrb6n1kc0008bmetb35le9fn:A1';
    const dir = 'sys.scratchpad.node';
    const hash = 'sha256-e2514f34f6d37a0bac782bddefbac5877de3883d1fa42bdb59264ad92984181d';
    const url = urls.fn.run;
    const body: t.IReqPostFuncSerial = [
      { host, uri, dir, silent: false, hash, in: { value: 123 } },
    ];

    const res = await http.post(url.toString(), body);

    const json = res.json as t.IResPostFunc;

    console.log('-------------------------------------------');
    console.log('res', res.json);
    console.log('-------------------------------------------');
    // console.log('results', (res.json as any).results);
    console.log('json', json.results);
    console.log('out', json.results[0]);

    // const url =
  });
});
