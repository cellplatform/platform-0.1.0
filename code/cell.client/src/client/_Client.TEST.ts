import { expect } from '../test';
import { Client } from '.';

describe('client', () => {
  it('parses host => origin', () => {
    const test = (host: string | number, expected: string) => {
      const res = Client.create(host);
      expect(res.origin).to.eql(expected);
    };

    test(80, 'http://localhost');
    test(1234, 'http://localhost:1234');
    test('1234', 'http://localhost:1234');
    test('localhost:8080', 'http://localhost:8080');
    test('https://localhost:8080', 'http://localhost:8080');

    test('https://domain.com', 'https://domain.com');
    test('https://domain.com:1234', 'https://domain.com:1234');
    test('domain.com:1234', 'https://domain.com:1234');
  });

  it('exposes URI builder', () => {
    const res = Client.create(8080);
    expect(res.uri.parse).to.be.an.instanceof(Function);
  });

  it('exposes URL builder (matching origin)', () => {
    const res = Client.create(8080);
    expect(res.url.origin).to.eql(res.origin);
  });
});
