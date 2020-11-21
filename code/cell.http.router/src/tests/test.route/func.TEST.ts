import { createMock, expect, Http, t } from '../../test';
import { NodeRuntime } from '@platform/cell.runtime/lib/node';

const funcMock = async () => {
  const runtime = NodeRuntime.init();

  const mock = await createMock({ runtime });
  const url = mock.urls.func.base.toString();
  const http = Http.create();

  return { url, mock, http, runtime };
};

describe.only('func', () => {
  // const url = mock.urls.func.base.toString()
  describe('over http', () => {
    it('does not exist (404)', async () => {
      const { mock, http, url } = await funcMock();

      // TODO 🐷 TEMP addresses
      const host = 'localhost:5000';
      const uri = 'cell:ckhon6cdk000o6hetdrtmd0dt:A1';
      const dir = 'sample//'; // NB: Path will be cleaned.
      // const http = Http.create();

      // mock.
      const data: t.IReqPostFuncBody = { uri, host, dir };
      const res = await http.post(url, data);
      const json = res.json;

      console.log('-------------------------------------------');
      console.log('res.status', res.status);
      console.log('json', json);

      expect(123).to.equal(123);

      await mock.dispose();
    });

    it('error: func/runtime not provided (500)', async () => {
      const mock = await createMock();
      const url = mock.urls.func.base.toString();
      const http = Http.create();

      const data: t.IReqPostFuncBody = { uri: 'cell:foo:A1' };
      const res = await http.post(url, data);
      const json = res.json as t.IHttpErrorServer;
      await mock.dispose();

      expect(json.status).to.eql(500);
      expect(json.type).to.eql('HTTP/server');
      expect(json.message).to.include(
        'A runtime environment for executing functions not available',
      );
    });
  });

  describe('RuntimeEnvNode', () => {
    it.skip('exists', async () => {
      //
    });

    it.skip('pull', async () => {
      //
    });

    it.skip('run', async () => {
      //
    });
  });
});
