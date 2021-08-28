import {
  t,
  expect,
  TestFs,
  TestPrep,
  CellAddress,
  HttpClient,
  Uri,
  slug,
  stringify,
} from '../test';
import { Stream } from '.';

describe.skip('ReadStream (web)', () => {
  const fs = TestFs.node;

  const PushPrep = async () => {
    const mock = await TestPrep();
    const server = await mock.server();

    const filepath = 'images/tree.png';
    const file = await mock.copy('static.test/child/tree.png', filepath);

    const address = CellAddress.create(server.host, Uri.create.A1());
    const http = HttpClient.create(address.domain).cell(address.uri);
    const remote = mock.events.remote.cell(address.toString());

    return { ...mock, address, http, remote, file, filepath };
  };

  describe.skip('read (Uint8Array)', () => {
    it('json', async () => {
      const test = async (input: t.Json) => {
        const res = await Stream.toUint8Array(input);
        const text = new TextDecoder().decode(res);
        expect(text).to.eql(stringify(input));
      };
      await test(undefined);
      await test(null);
      await test('hello');
      await test(1234);
      await test(true);
      await test([1, 2, 3]);
      await test({ foo: 123 });
    });

    it.skip('binary', async () => {
      const mock = await PushPrep();
      const { remote, http } = mock;
      await remote.push('images');

      const download = await http.fs.file(mock.filepath).download();
      // const f = ReadStream.isStream(download.body);
      // console.log('f', f);

      const res = await Stream.toUint8Array(download.body);

      // const f = fs.
      // fs.createReadStream(res.)

      console.log('-------------------------------------------');
      // console.log('res', res);
      console.log('download.body', download.body);
      const readable = download.body as ReadableStream;

      await mock.dispose();
    });
  });
});
