import { expect } from '../test';
import { Client } from '..';

/**
 * NOTE:
 *    Tests aginst the actual service using this client
 *    can be found in the [cell.http] module.
 */

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

  it('client.cell(...)', () => {
    const uri = 'cell:foo!A1';
    const client = Client.create();
    const res = client.cell(uri);
    expect(res.toString()).to.eql(uri);
  });
});
