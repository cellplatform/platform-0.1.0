import { createMock, expect, http, t } from '../../test';

describe('route: sys', () => {
  describe('errors', () => {
    it('GET: 404', async () => {
      const mock = await createMock();
      const url = mock.url('NO_EXIST');
      const res = await http.get(url);
      await mock.dispose();

      expect(res.status).to.eql(404);

      const body = res.json<t.INotFoundResponse>();

      expect(body.status).to.eql(404);
      expect(body.url).to.eql('/NO_EXIST');
      expect(body.message).to.contain('Not found');
      expect(body.type).to.eql('HTTP/404');
    });
  });
});
