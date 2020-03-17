import { Readable } from 'stream';
import { http } from '..';
import { fs, expect, t, time, toRawHeaders } from '../test';

describe('http', () => {
  describe('default instance (singleton)', () => {
    it('has methods', () => {
      expect(http.head).to.be.an.instanceof(Function);
      expect(http.get).to.be.an.instanceof(Function);
      expect(http.put).to.be.an.instanceof(Function);
      expect(http.post).to.be.an.instanceof(Function);
      expect(http.patch).to.be.an.instanceof(Function);
      expect(http.delete).to.be.an.instanceof(Function);
    });

    it('has empty headers (by default)', () => {
      expect(http.headers).to.eql({});
    });
  });

  describe('create', () => {
    it('creates (default headers)', () => {
      const client = http.create();
      expect(client.headers).to.eql({});
    });

    it('creates with custom headers (passed through all calls)', () => {
      const client = http.create({ headers: { MyHeader: 'abc' } });
      expect(client.headers.MyHeader).to.eql('abc');
    });
  });

  describe('headers', () => {
    it('headers immutable', () => {
      const lib = http.create({ headers: { foo: 'hello' } });
      const res1 = lib.headers;
      const res2 = lib.headers;

      expect(res1).to.eql(res2);
      expect(res1).to.not.equal(res2);
    });

    it('merges headers (client => method)', async () => {
      const client = http.create({ headers: { foo: 'one' } });
      client.before$.subscribe(e => e.respond({ status: 200 })); // Fake.

      const res = await client.get('http://localhost/foo', { headers: { bar: 'two' } });
      const headers = res.headers;
      expect(headers.foo).to.eql('one');
      expect(headers.bar).to.eql('two');
    });

    it('overrides headers (client => method)', async () => {
      const client = http.create({ headers: { foo: 'one' } });
      client.before$.subscribe(e => e.respond({ status: 200 })); // Fake.

      const res = await client.get('http://localhost/foo', { headers: { foo: 'two' } });
      const headers = res.headers;
      expect(headers.foo).to.eql('two');
    });
  });

  describe('events (observable)', () => {
    it('BEFORE event', async () => {
      const client = http.create();
      const events: t.IHttpBefore[] = [];

      client.before$.subscribe(e => e.respond({ status: 200 })); // Fake.
      client.before$.subscribe(e => events.push(e));

      await client.get('http://localhost/foo');

      expect(events.length).to.eql(1);
      expect(events[0].method).to.eql('GET');
      expect(events[0].url).to.eql('http://localhost/foo');
    });

    it('AFTER event: respond sync (json)', async () => {
      const client = http.create();
      const events: t.IHttpAfter[] = [];

      client.before$.subscribe(e => {
        // Fake response.
        e.respond({
          status: 202,
          statusText: 'foobar',
          data: { msg: 'hello' },
        });
      });
      client.after$.subscribe(e => events.push(e));

      const res1 = await client.get('http://localhost/foo');

      expect(events.length).to.eql(1);

      expect(events[0].method).to.eql('GET');
      expect(events[0].url).to.eql('http://localhost/foo');

      const res2 = events[0].response;
      expect(res2.status).to.eql(202);
      expect(res2.statusText).to.eql('foobar');

      expect(res1.text).to.eql(res2.text);
      expect(res1.json).to.eql({ msg: 'hello' });
    });

    it('AFTER event: respond async function (json)', async () => {
      const client = http.create();
      const events: t.IHttpAfter[] = [];

      client.before$.subscribe(e => {
        // Fake response.
        e.respond(async () => {
          await time.wait(20);
          return {
            status: 202,
            statusText: 'foobar',
            data: { msg: 'hello' },
          };
        });
      });
      client.after$.subscribe(e => events.push(e));

      const res1 = await client.get('http://localhost/foo');

      expect(events.length).to.eql(1);
      expect(events[0].method).to.eql('GET');
      expect(events[0].url).to.eql('http://localhost/foo');

      const res2 = events[0].response;
      expect(res2.status).to.eql(202);
      expect(res2.statusText).to.eql('foobar');

      expect(res1.text).to.eql(res2.text);
      expect(res1.json).to.eql({ msg: 'hello' });
    });

    it('AFTER event: respond sync function (file/binary)', async () => {
      const client = http.create();
      const events: t.IHttpAfter[] = [];

      const image1 = await fs.readFile(fs.resolve('src/test/assets/kitten.jpg'));
      const image2 = await fs.readFile(fs.resolve('src/test/assets/bird.png'));

      client.before$.subscribe(e => {
        // Create a return stream.
        // Source: https://stackoverflow.com/a/44091532
        const data = new Readable();
        data.push(image2);
        data.push(null);

        // Switch out the return data with a different file (stream).
        e.respond(() => ({ status: 202, statusText: 'foobar', data }));
      });
      client.after$.subscribe(e => events.push(e));

      const res = await client.post('http://localhost/foo', image1);

      expect(events.length).to.eql(1);
      expect(events[0].method).to.eql('POST');
      expect(events[0].url).to.eql('http://localhost/foo');

      if (res.body) {
        const path = fs.join('tmp/response-bird.png');
        await fs.stream.save(path, res.body);
        expect((await fs.readFile(path)).toString()).to.eql(image2.toString());
      }
    });

    it('sends event-id ("eid") that is shared between before/after events', async () => {
      const client = http.create();
      client.before$.subscribe(e => e.respond({ status: 200 })); // Fake.

      const events: t.HttpEvent[] = [];
      client.events$.subscribe(e => events.push(e));

      await client.get('http://localhost/foo');

      expect(events.length).to.eql(2);
      expect(events[0].payload.eid).to.eql(events[1].payload.eid);
    });

    it('does not share events between instances', async () => {
      const client1 = http.create();
      const client2 = client1.create();

      client1.before$.subscribe(e => e.respond({ status: 200 })); // Fake.
      client2.before$.subscribe(e => e.respond({ status: 200 })); // Fake.

      const events1: t.HttpEvent[] = [];
      const events2: t.HttpEvent[] = [];

      client1.events$.subscribe(e => events1.push(e));
      client2.events$.subscribe(e => events2.push(e));

      await client1.get('http://localhost/foo');
      await client2.get('http://localhost/foo');
      await client2.get('http://localhost/foo');

      expect(events1.length).to.eql(2);
      expect(events2.length).to.eql(4);
    });
  });

  describe('verbs', () => {
    let events: t.HttpEvent[] = [];
    let client: t.IHttp;

    beforeEach(() => {
      events = [];
      client = http.create();

      client.events$.subscribe(e => events.push(e));
      client.before$.subscribe(e => e.respond({ status: 200 })); // Fake.
    });

    it('head', async () => {
      await client.head('http://localhost/foo');
      expect(events.length).to.eql(2);
      expect(events[0].payload.method).to.eql('HEAD');
      expect(events[1].payload.method).to.eql('HEAD');
    });

    it('get', async () => {
      await client.get('http://localhost/foo');
      expect(events.length).to.eql(2);
      expect(events[0].payload.method).to.eql('GET');
      expect(events[1].payload.method).to.eql('GET');
    });

    it('put', async () => {
      await client.put('http://localhost/foo', { foo: 123 });
      expect(events.length).to.eql(2);
      expect(events[0].payload.method).to.eql('PUT');
      expect(events[1].payload.method).to.eql('PUT');
    });

    it('post', async () => {
      await client.post('http://localhost/foo', { foo: 123 });
      expect(events.length).to.eql(2);
      expect(events[0].payload.method).to.eql('POST');
      expect(events[1].payload.method).to.eql('POST');
    });

    it('patch', async () => {
      await client.patch('http://localhost/foo', { foo: 123 });
      expect(events.length).to.eql(2);
      expect(events[0].payload.method).to.eql('PATCH');
      expect(events[1].payload.method).to.eql('PATCH');
    });

    it('delete', async () => {
      await client.delete('http://localhost/foo');
      expect(events.length).to.eql(2);
      expect(events[0].payload.method).to.eql('DELETE');
      expect(events[1].payload.method).to.eql('DELETE');
    });
  });
});
