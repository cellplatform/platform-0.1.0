import { createMock, expect, t } from '../test';

describe('cell', () => {
  it('does not exist (404)', async () => {
    const mock = await createMock();
    const client = mock.client;

    const uri = 'cell:foo:A1';
    const res = await client.cell(uri).info();
    await mock.dispose();

    expect(res.body.exists).to.eql(false);
    expect(res.body.uri).to.eql(uri);
    expect(res.body.data).to.eql({});
    expect(res.error).to.eql(undefined);
  });

  it('exists', async () => {
    const mock = await createMock();
    const client = mock.client;

    await client.ns('foo').write({ cells: { A1: { value: 'hello' } } }); // Force A1 into existence in DB.

    const uri = 'cell:foo:A1';
    const res = await client.cell(uri).info();
    await mock.dispose();

    expect(res.status).to.eql(200);
    expect(res.body.exists).to.eql(true);
    expect(res.body.uri).to.eql(uri);
    expect(res.body.data.value).to.eql('hello');
    expect(res.error).to.eql(undefined);
  });
});
