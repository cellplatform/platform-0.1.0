import { Client } from '.';
import { HttpClient } from '../Client.http';
import { expect } from '../test';

/**
 * NOTE:
 *    Main integration tests using the [Client]
 *    can be found in module:
 *
 *        @platform/cell.router
 *
 */

describe('Client', () => {
  it('Client.Http', () => {
    expect(Client.Http).to.equal(HttpClient);
  });
});
