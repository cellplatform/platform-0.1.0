import { t, expect, http, createMock, stripHashes, post } from '../../../test';

describe.only('route: file', () => {
  describe('invalid URI', () => {
    const test = async (path: string, expected: string) => {
      const mock = await createMock();
      const url = mock.url(path);
      const res = await http.get(url);
      await mock.dispose();

      const body = res.json();

      expect(res.status).to.eql(400);
      expect(body.error.type).to.eql('HTTP/uri/malformed');
      expect(body.error.message).to.contain('Malformed');
      expect(body.error.message).to.contain(expected);
    };

    it('malformed: no id', async () => {
      const msg = 'does not contain a namespace-identifier';
      await test('/file:.123', msg);
    });
  });

  it.skip('TMP', async () => {
    const mock = await createMock();
    const url = mock.url('file:foo.123');
    const res = await http.get(url);

    await mock.dispose();

    // const { res, json, data } = await post.ns('ns:foo?cells', {
    //   cells: { A1: { value: 'hello' } },
    // });
    // const cells = data.cells || {};

    console.log('-------------------------------------------');
    console.log('url', url);
    // console.log('cells', cells);
    console.log('res', res);
    console.log('res.body', res.body);
  });

  describe('POST', () => {
    it('post binary file', async () => {
      const mock = await createMock();
      const url = mock.url('file:foo.123');

      const res = await http.post(url, {});

      console.log('-------------------------------------------');
      console.log('res.body', res.body);
    });
  });
});
