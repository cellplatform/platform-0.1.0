import { expect, http, t, mockServer, FormData, fs } from '../test';

describe('micro (server)', () => {
  it('200', async () => {
    const mock = await mockServer();

    mock.router.get('/foo', async req => {
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
    await mock.dispose();

    expect(res.status).to.eql(404);

    const json = res.json();
    expect(json.status).to.eql(404);
    expect(json.message).to.contain('Not found');
  });

  it('* (wildcard)', async () => {
    const mock = await mockServer();

    mock.router.get('/foo', async req => ({ data: { url: req.url } }));
    mock.router.get('*', async req => ({ data: { wildcard: true } }));

    const res1 = await http.get(mock.url('/foo'));
    const res2 = await http.get(mock.url('/bar'));
    await mock.dispose();

    expect(res1.json()).to.eql({ url: '/foo' });
    expect(res2.json()).to.eql({ wildcard: true });
  });

  it('has params', async () => {
    const test = async (route: string, path: string, expected: any) => {
      const mock = await mockServer();
      let params: t.RequestParams | undefined;
      mock.router.get(route, async req => {
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
      mock.router.get('/foo', async req => {
        query = req.query;
        return { status: 200, data: {} };
      });

      await http.get(mock.url(path));
      await mock.dispose();

      if (query) {
        delete query.toString; // NB: Hack, remove the [toString] method for simpler test comparison.
      }
      expect(query).to.eql(expected);
    };

    await test('/foo', {});
    await test('/foo?q=123', { q: 123 });
    await test('/foo?q=123&q=hello', { q: [123, 'hello'] });
  });

  it('complex route and query-string', async () => {
    const mock = await mockServer();

    let count = 0;
    const params: t.RequestParams[] = [];
    const queries: t.RequestQuery[] = [];

    mock.router.get(`/ns\\::id([A-Za-z0-9]*)(/?)`, async req => {
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

    queries.forEach(q => delete q.toString); // NB: Hack, remove the [toString] method for simpler test comparison.

    expect(queries[0]).to.eql({});
    expect(queries[1]).to.eql({});
    expect(queries[2]).to.eql({ data: 123 });
    expect(queries[3]).to.eql({ count: [123, 456] });
  });

  it('POST file (multipart/form-data)', async () => {
    const mock = await mockServer();
    const dir = fs.resolve(`tmp/test`);

    const files: string[] = [];
    mock.router.post(`/binary`, async req => {
      const data = await req.body.form();
      await fs.ensureDir(dir);
      for (const file of data.files) {
        files.push(file.name);
        await fs.writeFile(fs.join(dir, file.name), file.buffer);
      }
      return {};
    });

    // Prepare the [multipart/form-data] to post.
    const png = await fs.readFile(fs.resolve('src/test/images/bird.png'));
    const form = new FormData();
    form.append('image', png, {
      filename: `image.png`,
      contentType: 'application/octet-stream',
    });
    const headers = form.getHeaders();
    await http.post(mock.url('/binary'), form, { headers });
    await mock.dispose();

    expect(files).to.eql(['image.png']);

    // NB: Ensure the saved PNG file matches the posted file.
    const saved = await fs.readFile(fs.join(dir, 'image.png'));
    expect(png.toString()).to.eql(saved.toString());
  });
});
