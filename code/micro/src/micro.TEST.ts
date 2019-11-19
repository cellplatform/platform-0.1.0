import { expect, http } from './test';
import { micro } from '.';

describe('micro (server)', () => {
  it('200', async () => {
    const app = micro.init();

    app.router.get('/foo', async req => {
      return { data: { msg: 'hello' } };
    });

    const port = 55978;
    const instance = await app.listen({ port, silent: true });
    const url = `http://localhost:${port}/foo`;
    const res = await http.get(url);

    expect(res.status).to.eql(200);
    expect(await res.json()).to.eql({ msg: 'hello' });

    await instance.close();
  });

  it('404', async () => {
    const app = micro.init();

    const port = 55978;
    const instance = await app.listen({ port, silent: true });
    const url = `http://localhost:${port}/foo`;
    const res = await http.get(url);

    expect(res.status).to.eql(404);
    expect(await res.json()).to.eql({ status: 404, message: 'Not found.' });

    await instance.close();
  });
});
