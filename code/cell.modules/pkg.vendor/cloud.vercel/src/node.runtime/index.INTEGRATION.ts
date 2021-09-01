import { time, expect, Http, t } from '../test';
import { HttpClient } from '@platform/cell.client';
import { IReqPostFuncBody } from '@platform/cell.types';
import { Schema } from '@platform/cell.schema';

describe.skip('node.runtime/vercel', function () {
  this.timeout(30000);

  it('run cell/function ("localhost:5000/fn:run")', async () => {
    // const uri = 'cell:cks45jzjq000hejet2xueai66:A1';
    const uri = 'cell:cks82mgiv000h11ethgn3hsgz:A1';
    const host = 'http://localhost:5000';
    const dir = 'node.HEAD';

    const body: IReqPostFuncBody = [
      {
        host,
        uri,
        dir,
        in: { value: `in 🌳` },
        timeout: 'never',
      },
    ];

    const pull = true;
    const url = `${host}/fn:run?pull=${pull}`;
    console.log('url', url);
    console.log('-------------------------------------------');

    const run = async () => {
      const http = Http.create();
      const res = await http.post(url, body);
      const json = res.json as any;

      // console.log('json', json);

      const elapsed = json.elapsed as number;
      const result = json.results[0];
      const out = result?.out?.value;

      console.log('result', result);

      console.log(`[${json.elapsed}ms] out:`, out);

      return { elapsed, json };
    };

    await run();

    const timer = time.timer();
    const running = Array.from({ length: 1 }).map(async () => {
      return await run();
    });

    await Promise.all(running);
    console.log('elapsed', timer.elapsed.toString());
  });
});
