import { expect, http, t, mockServer } from '../test';
import { micro } from '..';

describe('micro (server)', () => {
  it('200', async () => {
    const mock = await mockServer();

    mock.app.router.get('/foo', async req => {
      return { data: { msg: 'hello' } };
    });

    const res = await http.get(mock.url('/foo'));
    await mock.dispose();

    expect(res.status).to.eql(200);
    expect(await res.json()).to.eql({ msg: 'hello' });
  });

  it('404 (default)', async () => {
    const mock = await mockServer();
    const res = await http.get(mock.url('/foo'));
    expect(res.status).to.eql(404);
    expect(await res.json()).to.eql({ status: 404, message: 'Not found.' });
  });

  it('has params', async () => {
    const test = async (route: string, path: string, expected: any) => {
      const mock = await mockServer();
      let params: t.RequestParams | undefined;
      mock.app.router.get(route, async req => {
        params = req.params;
        return { status: 200, data: {} };
      });

      await http.get(mock.url(path));
      await mock.dispose();

      expect(params).to.eql(expected);
    };

    await test('/foo/:id/:name?', '/foo/123/sarah', { id: 123, name: 'sarah' });
    await test('/foo/:id/:name?', '/foo/123', { id: 123 });
    await test('/foo', '/foo', {});
  });

  it('has query', async () => {
    const test = async (path: string, expected: any) => {
      const mock = await mockServer();
      let query: t.RequestQuery | undefined;
      mock.app.router.get('/foo', async req => {
        query = req.query;
        return { status: 200, data: {} };
      });

      await http.get(mock.url(path));
      await mock.dispose();

      expect(query).to.eql(expected);
    };

    await test('/foo', {});
    await test('/foo?q=123', { q: 123 });
    await test('/foo?q=123&q=hello', { q: [123, 'hello'] });
  });

  it('complex route and query string', async () => {
    const mock = await mockServer();

    let count = 0;
    const params: t.RequestParams[] = [];
    const queries: t.RequestQuery[] = [];
    mock.app.router.get('/ns::id([A-Z0-9]*)(/?)', async req => {
      params.push(req.params);
      queries.push(req.query);
      count++;
      return { data: { count } };
    });

    const res1 = await http.get(mock.url('/ns:foo'));
    const res2 = await http.get(mock.url('/ns:foo/'));
    const res3 = await http.get(mock.url('/ns:foo?data=123'));
    const res4 = await http.get(mock.url('/ns:foo/?count=123&count=456'));

    await mock.dispose();

    expect(await res1.json()).to.eql({ count: 1 });
    expect(await res2.json()).to.eql({ count: 2 });
    expect(await res3.json()).to.eql({ count: 3 });
    expect(await res4.json()).to.eql({ count: 4 });

    expect(params.length).to.eql(4);
    expect(params[0].id).to.eql('foo');
    expect(params[1].id).to.eql('foo');
    expect(params[2].id).to.eql('foo');
    expect(params[3].id).to.eql('foo');

    expect(queries.length).to.eql(4);
    expect(queries[0]).to.eql({});
    expect(queries[1]).to.eql({});
    expect(queries[2]).to.eql({ data: 123 });
    expect(queries[3]).to.eql({ count: [123, 456] });
  });
});
