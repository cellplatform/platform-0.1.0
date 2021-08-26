import { ReadStreamNode } from '.';
import { Hash, CellAddress, expect, HttpClient, slug, TestFs, TestPrep, Uri, time } from '../test';

describe('ReadStreamNode', () => {
  const fs = TestFs.node;

  const PushPrep = async () => {
    const mock = await TestPrep();
    const server = await mock.server();

    const address = CellAddress.create(server.host, Uri.create.A1());
    const http = HttpClient.create(address.domain).cell(address.uri);
    const remote = mock.events.remote.cell(address.toString());

    return { ...mock, address, http, remote };
  };

  const PATH = {
    TREE: fs.resolve('static.test/child/tree.png'),
  };

  it('isReadableStream', async () => {
    const mock = await PushPrep();
    const { remote, fs } = mock;
    const filepath = 'images/tree.png';
    await mock.copy('static.test/child/tree.png', filepath);

    const download = async () => (await mock.http.fs.file(filepath).download()).body;

    const test = (input: any, expected: boolean) => {
      const res = ReadStreamNode.isReadableStream(input);
      expect(res).to.eql(expected);
    };

    test(undefined, false);
    test(null, false);
    test(1234, false);
    test({}, false);
    test([], false);
    test(true, false);
    test('', false);

    // Fetch response.
    test(await download(), false); // NB: The result is not a stream until the file has been pushed to the cell.
    await mock.remote.push('images');
    test(await download(), true);

    // Node.
    const dir = fs.resolve('tmp/node.isReadableStream');
    await fs.ensureDir(dir);
    test(fs.createReadStream(PATH.TREE), true);
    test(fs.createWriteStream(fs.join(dir, slug())), false);

    await mock.dispose();
  });

  it('encode/decode (Uint8Array)', async () => {
    const text = 'Hello';
    const encoded = ReadStreamNode.encode(text);
    const decoded = ReadStreamNode.decode(encoded);
    expect(decoded).to.eql(text);
  });

  describe('toUint8Array', () => {
    it('binary', async () => {
      const mock = await PushPrep();
      const { remote, http, fs } = mock;

      const filepath = 'images/tree.png';
      const file = await mock.copy('static.test/child/tree.png', filepath);
      await remote.push('images');

      const download = await http.fs.file(filepath).download();
      const res = await ReadStreamNode.toUint8Array(download.body);

      const path = fs.resolve('tmp/node.toUint8Array/binary.png');
      await fs.ensureDir(fs.dirname(path));
      await fs.writeFile(path, res);

      const saved = Uint8Array.from(await fs.readFile(path));
      expect(Hash.sha256(res)).to.eql(file.hash);
      expect(Hash.sha256(saved)).to.eql(file.hash);

      await mock.dispose();
    });

    it('json', async () => {
      const mock = await PushPrep();
      const { remote, http, fs } = mock;

      const filepath = 'data.json';
      const file = await mock.copy('static.test/data.json', filepath);
      await remote.push();

      const download = await http.fs.file(filepath).download();
      const res = await ReadStreamNode.toUint8Array(download.body);

      const path = fs.resolve('tmp/node.toUint8Array/data.json');
      await fs.ensureDir(fs.dirname(path));
      await fs.writeFile(path, res);

      const saved = Uint8Array.from(await fs.readFile(path));
      expect(Hash.sha256(res)).to.eql(file.hash);
      expect(Hash.sha256(saved)).to.eql(file.hash);

      await mock.dispose();
    });
  });
});
