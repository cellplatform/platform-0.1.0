import { expect, http, t } from './test';
import { micro } from '.';

describe('micro (server)', () => {
  it('200', async () => {
    const app = micro.init();
    const port = 55978;
    const instance = await app.listen({ port, silent: true });

    app.router.get('/foo', async req => {
      return { data: { msg: 'hello' } };
    });

    const res = await http.get(`http://localhost:${port}/foo`);
    await instance.close();

    expect(res.status).to.eql(200);
    expect(await res.json()).to.eql({ msg: 'hello' });
  });

  it('404', async () => {
    const app = micro.init();
    const port = 55979;
    const instance = await app.listen({ port, silent: true });
    const res = await http.get(`http://localhost:${port}/foo`);
    await instance.close();

    expect(res.status).to.eql(404);
    expect(await res.json()).to.eql({ status: 404, message: 'Not found.' });
  });

  it('complex route and query string', async () => {
    const app = micro.init();
    const port = 55980;
    const instance = await app.listen({ port, silent: true });

    let count = 0;
    const params: t.RequestParams[] = [];

    app.router.get('/ns::id([A-Z0-9]*)(/?)', async req => {
      params.push(req.params);
      count++;
      return { data: { count } };
    });

    const domain = `http://localhost:${port}`;
    const res1 = await http.get(`${domain}/ns:foo`);
    const res2 = await http.get(`${domain}/ns:foo/`);
    const res3 = await http.get(`${domain}/ns:foo?data=123`);
    const res4 = await http.get(`${domain}/ns:foo/?data=123`);

    await instance.close();

    expect(await res1.json()).to.eql({ count: 1 });
    expect(await res2.json()).to.eql({ count: 2 });
    expect(await res3.json()).to.eql({ count: 3 });
    expect(await res4.json()).to.eql({ count: 4 });

    expect(params[0].id).to.eql('foo');
    expect(params[1].id).to.eql('foo');
    expect(params[2].id).to.eql('foo');
    expect(params[3].id).to.eql('foo');

    // TODO - query string
  });
});
