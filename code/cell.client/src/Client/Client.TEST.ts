import { Client } from '.';
import { HttpClient } from '../Client.http';
import { expect, TypeSystem } from '../test';

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

  it('Client.TypeSystem', () => {
    expect(Client.TypeSystem).to.eql(TypeSystem);
  });
});
