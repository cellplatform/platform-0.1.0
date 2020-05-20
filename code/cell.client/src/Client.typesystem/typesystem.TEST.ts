import { Client } from '..';
import { HttpClient } from '../Client.http';
import { expect, t, MemoryCache } from '../test';

/**
 * NOTE:
 *    Main integration tests using the [Client]
 *    can be found in module:
 *
 *        @platform/cell.http.router
 *
 */

describe('Client.typesystem', () => {
  it('creates client', () => {
    const test = (input: string | number | t.IHttpClientOptions | undefined, origin: string) => {
      const res = Client.typesystem({ http: input });
      expect(res.http.origin).to.eql(origin);
      expect(HttpClient.isClient(res.http)).to.eql(true);
    };

    test(undefined, 'http://localhost:8080');
    test(1234, 'http://localhost:1234');
    test('domain.com', 'https://domain.com');
    test('domain.com:1234', 'https://domain.com:1234');
    test({ host: 'foo.com' }, 'https://foo.com');
  });

  it('uses given [IHttpClient]', () => {
    const http = HttpClient.create();
    const res = Client.typesystem({ http });
    expect(res.http).to.equal(http);
  });

  describe('cache', () => {
    it('create cache', () => {
      const http = HttpClient.create();
      const res = Client.typesystem({ http });
      expect(res.cache).to.be.an.instanceof(MemoryCache);
    });

    it('use given cache', () => {
      const http = HttpClient.create();
      const cache = MemoryCache.create();
      const res = Client.typesystem({ http, cache });
      expect(res.cache).to.equal(cache);
    });
  });
});
