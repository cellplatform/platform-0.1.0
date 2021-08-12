import { expect, fs, Http, t } from '../test';
import { VercelHttp } from '.';
import { util, DEFAULT } from './common';

/**
 * See:
 *    https://vercel.com/docs/api#endpoints
 */

describe('VercelHttp', function () {
  const token = process.env.VERCEL_TEST_TOKEN ?? '';
  const http = Http.create();
  const ctx = util.toCtx(fs, http, token);
  const client = VercelHttp({ fs, token });

  describe('util', () => {
    it('toUrl', () => {
      expect(util.toUrl(12, '  teams  ')).to.eql('https://api.vercel.com/v12/teams');
      expect(util.toUrl(12, 'teams?123')).to.eql('https://api.vercel.com/v12/teams'); // NB: Strips query-string.
    });

    it('toUrl: query', () => {
      type Q = Record<string, string | number | undefined>;

      const test = (query: Q, expected: string) => {
        const res = util.toUrl(12, 'projects', query);
        expect(res).to.eql(`${'https://api.vercel.com/v12/projects'}${expected}`);
      };

      test({}, '');
      test({ teamId: 'foo' }, '?teamId=foo');
      test({ teamId: 'foo', foo: 123 }, '?teamId=foo&foo=123');

      test({ teamId: undefined }, '');
      test({ teamId: undefined, foo: 123 }, '?foo=123');
    });

    it('toCtx', () => {
      const token = 'abc123';
      const res1 = util.toCtx(fs, http, token);
      const res2 = util.toCtx(fs, http, token, 1234);

      expect(res1.token).to.eql(token);
      expect(res1.Authorization).to.eql(`Bearer ${token}`);
      expect(res1.headers.Authorization).to.eql(res1.Authorization);

      expect(res1.version).to.eql(DEFAULT.version);
      expect(res2.version).to.eql(1234);
    });

    it('toCtx: ctx.url', () => {
      const token = 'abc123';
      const res1 = util.toCtx(fs, http, token);
      const res2 = util.toCtx(fs, http, token, 1234);

      expect(res1.url('foo')).to.match(new RegExp(`\/v${DEFAULT.version}\/foo$`));
      expect(res1.url('foo', { bar: 123 })).to.match(/\/foo\?bar=123$/);

      expect(res2.url('foo')).to.match(/\/v1234\/foo$/);
      expect(res2.url('foo', undefined, { version: 456 })).to.match(/\/v456\/foo$/);
    });
  });

  it('create (API version)', async () => {
    const client1 = VercelHttp({ fs, token });
    const client2 = VercelHttp({ fs, token, version: 1234 });

    expect(client1.version).to.eql(DEFAULT.version);
    expect(client2.version).to.eql(1234);
  });

  it('not authorized', async () => {
    const token = 'abc123';
    const client = VercelHttp({ fs, token });

    const res = await client.teams.list();

    expect(res.ok).to.eql(false);
    expect(res.status).to.eql(403);
    expect(res.error?.code).to.eql('forbidden');
    expect(res.error?.message).to.include('Not authorized');
  });

  it('intercept http', async () => {
    const http = Http.create();
    // const token = 'abc123';
    const client = VercelHttp({ fs, http, token });

    // type HttpLog = { status: number; method: t.HttpMethod; body: t.Json };
    // const after: HttpLog[] = [];

    http.$.subscribe((e) => {
      // console.log('e', e);
    });

    http.res$.subscribe((e) => {
      console.log('-------------------------------------------');
      console.log('🌳', e.method, e.status, e.url);

      // console.log(e.response.json);
      // const { status, method } = e;
      // const body = e.response.json;
      // after.push({ status, method, body });
    });

    const res = await client.teams.list();

    console.log('-------------------------------------------');
    console.log(
      'res',
      res.teams.map((e) => e.name),
    );

    // const path = fs.resolve('tmp/http.log.json');
    // console.log('path', path);

    // await fs.writeJson(path, after);

    // client.
  });
});
