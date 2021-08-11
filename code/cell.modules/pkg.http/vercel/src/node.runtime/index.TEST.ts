import { expect, Http, t } from '../test';
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

    const url = `${host}/fn:run?pull=true`;
    console.log('url', url);

    const http = Http.create();
    const res = await http.post(url, body);
    const json = res.json as any;

    console.log('-------------------------------------------');
    console.log('res', res.json);

    const result = json.results[0];
    console.log('res.json.results', result);

    console.log('result.out', result.out);
    console.log('result.out.info', result?.value?.info);

    // const url = urls.
    // http://localhost:60470/fn:run
    // cell.
    // client.
  });
});
