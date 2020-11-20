import { createMock, expect, Http, t } from '../../test';

describe.only('func', () => {
  it('does not exist (404)', async () => {
    const mock = await createMock();

    const url = mock.urls.func.base.toString();

    // TODO 🐷 TEMP addresses
    const host = 'localhost:5000';
    const uri = 'cell:ckhon6cdk000o6hetdrtmd0dt:A1';
    const dir = 'sample//'; // NB: Path will be cleaned.
    const http = Http.create();

    // mock.
    const data: t.IReqPostFuncBody = { uri, host, dir };

    const res = await http.post(url, data);
    const json = res.json;

    console.log('-------------------------------------------');
    console.log('res.status', res.status);
    console.log('json', json);

    await mock.dispose();
  });
});
