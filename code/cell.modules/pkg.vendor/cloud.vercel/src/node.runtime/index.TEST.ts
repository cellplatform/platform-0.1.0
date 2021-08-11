import { time, expect, Http, t } from '../test';
import { HttpClient } from '@platform/cell.client';
import { IReqPostFuncBody } from '@platform/cell.types';
import { Schema } from '@platform/cell.schema';

describe('node.runtime/vercel', function () {
  this.timeout(30000);

  it.only('run cell/function ("localhost:5000/fn:run")', async () => {
    // const uri = 'cell:cks45jzjq000hejet2xueai66:A1';
    const uri = 'cell:cks5anhhe000h0kethe9sb1ha:A1';
    const host = 'http://localhost:5000';
    const dir = 'foobar';

    const body: IReqPostFuncBody = [
      {
        host,
        uri,
        dir,
        in: { value: `in 🌳` },
        timeout: 'never',
      },
    ];

    const url = `${host}/fn:run`;
    console.log('url', url);
    console.log('-------------------------------------------');

    const run = async () => {
      const http = Http.create();
      const res = await http.post(url, body);
      const json = res.json as any;

      const elapsed = json.elapsed as number;
      const result = json.results[0];
      const out = result?.out?.value;

      console.log(`[${json.elapsed}ms] out:`, out);

      return { elapsed, json };
    };

    await run();

    const timer = time.timer();
    const running = Array.from({ length: 3 }).map(async () => {
      return await run();
    });

    await Promise.all(running);
    console.log('elapsed', timer.elapsed.toString());
  });
});
