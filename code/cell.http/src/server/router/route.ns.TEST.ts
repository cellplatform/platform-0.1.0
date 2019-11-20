import { t, expect, http, mock } from '../../test';

describe('route: namespace', () => {
  it('invalid "ns" URI (no id)', async () => {
    const test = await mock.create();
    const url = test.url('/ns:');
    const res = await http.get(url);
    await test.dispose();

    expect(res.status).to.eql(400);

    const body = res.json();
    expect(body.error.type).to.eql('HTTP/malformed');
    expect(body.error.message).to.contain('Malformed namespace URI, does not contain an ID');
  });

  it('does not yet exist', async () => {
    const test = await mock.create();
    const url = test.url('ns:foo');
    const res = await http.get(url);
    await test.dispose();

    expect(res.status).to.eql(200);

    const body = res.json<t.IGetNsResponse>();
    expect(body.uri).to.eql('ns:foo');
    expect(body.exists).to.eql(false);
    expect(body.createdAt).to.eql(-1);
    expect(body.modifiedAt).to.eql(-1);
    expect(body.data).to.eql({ ns: {} }); // NB: No data by default (requires query-string).

    // TODO - hash
  });

  describe('data', () => {
    it('POST change data', async () => {
      const test = await mock.create();
      const url = test.url('ns:foo');

      const payload: t.IPostNsBody = {
        data: {
          cells: {
            A1: { value: 'hello' },
          },
        },
      };

      const res = await http.post(url, payload);
      const res2 = await http.post(url, payload);

      console.log('-------------------------------------------');
      console.log('url:', url);

      await test.dispose();

      // console.log(res);
      console.log('res.json', res.json());
    });

    it('returns data (selective)', async () => {
      //
    });
  });

  // it('returns data (selective)', async () => {
  //   const test = await mock.create();
  //   const url = test.url('ns:foo');

  //   // await kill(8080);

  //   console.log('url', url);

  //   await test.dispose();
  // });
});
