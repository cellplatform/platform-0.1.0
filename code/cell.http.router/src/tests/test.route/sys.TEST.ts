import { createMock, expect, t } from '../../test';

describe('sys (root)', () => {
  it('info', async () => {
    const mock = await createMock();
    const client = mock.client;

    type T = t.IResGetSysInfo & { foo: number };
    const res = await client.info<T>();
    await mock.dispose();

    expect(res.status).to.eql(200);
    expect(res.body.foo).to.eql(undefined); // NB: On custom type as test (but not actually returned by server).
    expect(res.body.domain).to.eql(`${mock.host}:${mock.port}`);
  });
});
