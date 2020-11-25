import { createMock, expect, http, t } from '../../test';

describe('sys:', () => {
  describe('errors', () => {
    it('GET: 404', async () => {
      const mock = await createMock();
      const url = mock.url('NO_EXIST');
      const res = await http.get(url);
      await mock.dispose();

      expect(res.status).to.eql(404);

      const body = res.json as t.IHttpError;
      expect(body.status).to.eql(404);
      expect(body.message).to.contain('Resource not found');
      expect(body.type).to.eql('HTTP/notFound');
    });
  });
});
