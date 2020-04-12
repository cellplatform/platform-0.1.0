import { expect, TypeSystem, t } from '../test';
import { Client } from '.';
import { HttpClient } from '../HttpClient';

/**
 * NOTE:
 *    Main integration tests using the [Client]
 *    can be found in module:
 *
 *        @platform/cell.http.router
 *
 */

describe('Client', () => {
  it('Client.Http', () => {
    expect(Client.Http).to.equal(HttpClient);
  });
  it('Client.Type', () => {
    expect(Client.Type).to.eql(TypeSystem);
  });

  describe('Client.type', () => {
    it('creates client', () => {
      const test = (input: string | number | t.IHttpClientOptions | undefined, origin: string) => {
        const res = Client.type({ client: input });
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
      const client = HttpClient.create();
      const res = Client.type({ client });

      expect(res.http).to.equal(client);

      // expect(HttpClient.isClient(res.http)).to.eql(true);
    });
  });
});
