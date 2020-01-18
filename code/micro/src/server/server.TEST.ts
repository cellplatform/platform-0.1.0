import { micro } from '..';
import { expect, FormData, fs, http, mockServer, randomPort, t, time } from '../test';

describe('micro (server)', () => {
  it('200', async () => {
    const mock = await mockServer();

    mock.router.get('/foo', async req => {
      return { data: { msg: 'hello' } };
    });

    const res = await http.get(mock.url('/foo'));
    await mock.dispose();

    expect(res.status).to.eql(200);
    expect(await res.json).to.eql({ msg: 'hello' });
  });

  it('404 (default)', async () => {
    const mock = await mockServer();
    const res = await http.get(mock.url('/foo'));
    await mock.dispose();

    expect(res.status).to.eql(404);

    const json = res.json as any;
    expect(json && json.status).to.eql(404);
    expect(json && json.message).to.contain('Not found');
  });

  it('* (wildcard)', async () => {
    const mock = await mockServer();

    mock.router.get('/foo', async req => ({ data: { url: req.url } }));
    mock.router.get('*', async req => ({ data: { wildcard: true } }));

    const res1 = await http.get(mock.url('/foo'));
    const res2 = await http.get(mock.url('/bar'));
    await mock.dispose();

    expect(res1.json).to.eql({ url: '/foo' });
    expect(res2.json).to.eql({ wildcard: true });
  });

  it('stores service instance', async () => {
    const app = micro.init();
    expect(app.service).to.eql(undefined);

    const port = randomPort();
    await app.start({ port, silent: true });

    const service = app.service as t.IMicroService;
    expect(service.port).to.eql(port);
    expect(service.isRunning).to.eql(true);

    await app.stop();
    expect(app.service).to.eql(undefined);
    expect(service.isRunning).to.eql(false);
  });

  it('context (default)', async () => {
    const mock = await mockServer();

    let context: any;
    mock.router.get('/foo', async (req, ctx) => {
      context = ctx;
      return {};
    });

    await http.get(mock.url('/foo'));
    await mock.dispose();

    expect(context).to.eql({});
  });

  describe('req (request parameter)', () => {
    it('req.params', async () => {
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

    it('req.query', async () => {
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

    it('req.host', async () => {
      const mock = await mockServer();
      let req: t.Request | undefined;
      mock.router.get('/foo', async r => {
        req = r;
        return {};
      });

      await http.get(mock.url('/foo'));
      await mock.dispose();

      expect(req).to.not.eql(undefined);
      expect(req && req.host.startsWith('localhost:')).to.eql(true);
    });

    it('req.toUrl', async () => {
      const mock = await mockServer();
      let req: t.Request | undefined;
      mock.router.get('/foo', async r => {
        req = r;
        return {};
      });

      await http.get(mock.url('/foo'));
      await mock.dispose();

      expect(req).to.not.eql(undefined);
      if (req) {
        expect(req.toUrl('zoo?q=123')).to.eql(mock.url('/zoo?q=123'));
        expect(req.toUrl('https://domain.com/foo')).to.eql('https://domain.com/foo'); // NB: No change because "https" protocol given.
        expect(req.toUrl('')).to.eql(mock.url(''));
        expect(req.toUrl(undefined as any)).to.eql(mock.url(''));
        expect(req.toUrl(null as any)).to.eql(mock.url(''));
      }
    });

    it('req.redirect', async () => {
      const mock = await mockServer();
      let req: t.Request | undefined;
      mock.router.get('/foo', async r => {
        req = r;
        return {};
      });

      await http.get(mock.url('/foo'));
      await mock.dispose();

      expect(req).to.not.eql(undefined);
      if (req) {
        const headers = { 'x-foo': '123' };
        const res1 = req.redirect('/foo');
        const res2 = req.redirect(undefined as any, { headers });

        expect(res1.status).to.eql(307);
        expect(res1.data).to.eql(mock.url('/foo'));
        expect(res1.headers).to.eql(undefined);

        expect(res2.status).to.eql(307);
        expect(res2.data).to.eql(mock.url(''));
        expect(res2.headers).to.eql(headers);
      }
    });
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

    expect(res1.json).to.eql({ count: 1 });
    expect(res2.json).to.eql({ count: 2 });
    expect(res3.json).to.eql({ count: 3 });
    expect(res4.json).to.eql({ count: 4 });

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

  it('GET binary file (download => save => compare)', async () => {
    const mock = await mockServer();
    const png = await fs.readFile(fs.resolve('src/test/images/bird.png'));
    mock.router.get(`/image`, async req => ({ status: 200, data: png }));

    // Download the image from the HTTP server.
    const res = await http.get(mock.url('/image'));
    await mock.dispose();

    // Save and compare the downloaded file.
    const path = fs.resolve('tmp/download.bird.png');
    if (res.body) {
      await fs.stream.save(path, res.body);
    }
    const downloaded = await fs.readFile(path);
    expect(png.toString()).to.eql(downloaded.toString());
  });

  describe('events$', () => {
    it('HTTP/started | MICRO/stopped', async () => {
      const port = randomPort();
      const app = micro.init({ port });

      // Add sample routes (simulate startup time)
      // NB: Would typically never be this high!!
      Array.from({ length: 150 }).forEach((v, i) => {
        app.router.get(`/foo/${i}`, async req => ({}));
      });

      const events: t.MicroEvent[] = [];
      app.events$.subscribe(e => events.push(e));

      await app.start({ silent: true });
      expect(events.length).to.eql(1);

      const e1 = events[0] as t.IMicroStartedEvent;
      expect(e1.type).to.eql('HTTP/started');
      expect(e1.payload.elapsed.msec).to.greaterThan(0);
      expect(e1.payload.port).to.eql(port);

      await time.wait(20);
      await app.stop();
      expect(events.length).to.eql(2);

      const e2 = events[1] as t.IMicroStoppedEvent;
      expect(e2.type).to.eql('HTTP/stopped');
      expect(e2.payload.port).to.eql(port);
      expect(e2.payload.error).to.eql(undefined);
      expect(e2.payload.elapsed.msec).to.greaterThan(20);
    });

    it('HTTP/request | HTTP/response', async () => {
      const mock = await mockServer();
      const events: t.MicroEvent[] = [];
      mock.app.events$.subscribe(e => events.push(e));

      const res = { status: 200, data: { msg: 123 }, headers: { 'x-foo': 'hello' } };
      mock.router.get('/foo', async req => {
        await time.wait(20);
        return res;
      });
      await http.get(mock.url('/foo'));

      expect(events.length).to.eql(2); // [request] AND [response] events.

      const e1 = events[0] as t.IMicroRequestEvent;
      expect(e1.type).to.eql('HTTP/request');
      expect(e1.payload.isModified).to.eql(false);
      expect(e1.payload.url).to.eql('/foo');
      expect(e1.payload.method).to.eql('GET');
      expect(e1.payload.req.url).to.eql('/foo');
      expect(e1.payload.error).to.eql(undefined);

      const e2 = events[1] as t.IMicroResponseEvent;
      expect(e2.type).to.eql('HTTP/response');
      expect(e2.payload.isModified).to.eql(false);
      expect(e2.payload.url).to.eql('/foo');
      expect(e2.payload.method).to.eql('GET');
      expect(e2.payload.req.url).to.eql('/foo');
      expect(e2.payload.res).to.eql(res);
      expect(e2.payload.elapsed.msec).to.greaterThan(19); // NB: includes delay within route handler.
      expect(e2.payload.context).to.eql({});
      expect(e2.payload.error).to.eql(undefined);

      await mock.dispose();
    });

    describe('HTTP/request: modify', () => {
      it('sync', async () => {
        const mock = await mockServer();
        const events: t.MicroEvent[] = [];
        mock.app.events$.subscribe(e => events.push(e));

        let event1: micro.IMicroRequest | undefined;
        mock.app.request$.subscribe(e => {
          event1 = e;
          e.modify({ context: { user: 'Sarah' } });
        });

        let context: any;
        mock.router.get('/foo', async (req, ctx) => {
          context = ctx;
          return { data: { foo: 123 } };
        });
        await http.get(mock.url('/foo'));

        expect(event1 && event1.isModified).to.eql(true);
        expect(event1 && event1.error).to.eql(undefined);

        const event2 = (events[1] as t.IMicroResponseEvent).payload;
        expect(event2.context).to.eql({ user: 'Sarah' });
        expect(context).to.eql({ user: 'Sarah' });

        await mock.dispose();
      });

      it('async', async () => {
        const mock = await mockServer();
        const events: t.MicroEvent[] = [];
        mock.app.events$.subscribe(e => events.push(e));

        let event1: micro.IMicroRequest | undefined;
        mock.app.request$.subscribe(e => {
          event1 = e;
          e.modify(async () => {
            return { context: { user: 'Sarah' } };
          });
        });

        let context: any;
        mock.router.get('/foo', async (req, ctx) => {
          context = ctx;
          return { data: { foo: 123 } };
        });
        await http.get(mock.url('/foo'));

        expect(event1 && event1.isModified).to.eql(true);
        expect(event1 && event1.error).to.eql(undefined);

        const event2 = (events[1] as t.IMicroResponseEvent).payload;
        expect(event2.context).to.eql({ user: 'Sarah' });
        expect(context).to.eql({ user: 'Sarah' });

        await mock.dispose();
      });
    });

    describe('HTTP/response: modify', () => {
      it('sync', async () => {
        const mock = await mockServer();

        let event: micro.IMicroResponse | undefined;
        mock.app.response$.subscribe(e => {
          event = e;
          e.modify({
            ...e.res,
            headers: { ...e.res.headers, 'x-foo': 'hello' },
            data: { ...e.res.data, bar: 456 },
          });
        });

        mock.router.get('/foo', async req => ({ data: { foo: 123 } }));
        const res = await http.get(mock.url('/foo'));

        expect(event && event.isModified).to.eql(true);
        expect(event && event.res).to.eql({ data: { foo: 123 } }); // NB: modified response not changed on event.

        expect(res.json).to.eql({ foo: 123, bar: 456 }); // NB: modified response returned to HTTP call.
        expect(res.headers['x-foo']).to.eql('hello');

        await mock.dispose();
      });

      it('async', async () => {
        const mock = await mockServer();

        let event: micro.IMicroResponse | undefined;
        mock.app.response$.subscribe(e => {
          event = e;
          e.modify(async () => {
            await time.wait(20);
            return {
              ...e.res,
              headers: { ...e.res.headers, 'x-foo': 'hello' },
              data: { ...e.res.data, bar: 456 },
            };
          });
        });

        mock.router.get('/foo', async req => ({ data: { foo: 123 } }));
        const res = await http.get(mock.url('/foo'));

        expect(event && event.elapsed.msec).to.greaterThan(19);
        expect(event && event.isModified).to.eql(true);
        expect(event && event.res).to.eql({ data: { foo: 123 } }); // NB: modified response not changed on event.

        expect(res.json).to.eql({ foo: 123, bar: 456 }); // NB: modified response returned to HTTP call.
        expect(res.headers['x-foo']).to.eql('hello');

        await mock.dispose();
      });
    });
  });
});
