import { Client, expect } from '../../test';

describe('Client', () => {
  it('Client.http: from host (origin)', () => {
    const client = Client.http('localhost:1234');
    expect(client.origin).to.eql('http://localhost:1234');
  });
});
