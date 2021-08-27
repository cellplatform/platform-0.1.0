import { expect, expectError, t, stringify } from '../test';
import { fs } from '..';

import { Stream } from '.';

describe('Stream', function () {
  this.afterEach(() => fs.remove(PATH.TMP));

  const PATH = {
    TMP: fs.resolve('tmp/ReadStream'),
    TREE: fs.resolve('test/images/tree.png'),
    JSON: fs.resolve('test/file/foo.json'),
  };

  it('isReadableStream', async () => {
    const test = (input: any, expected: boolean) => {
      const res = Stream.isReadableStream(input);
      expect(res).to.eql(expected);
    };

    test(undefined, false);
    test(null, false);
    test(1234, false);
    test({}, false);
    test([], false);
    test(true, false);
    test('', false);

    // Node.
    await fs.ensureDir(PATH.TMP);
    test(fs.createReadStream(PATH.TREE), true);
    test(fs.createWriteStream(fs.join(PATH.TMP, 'test.isReadableStream')), false);
  });

  it('encode/decode (Uint8Array)', async () => {
    const text = 'Hello';
    const encoded = Stream.encode(text);
    const decoded = Stream.decode(encoded);
    expect(decoded).to.eql(text);
  });

  describe('toUint8Array', () => {
    it('json', async () => {
      const json = { foo: 123 };
      const res = await Stream.toUint8Array(json);
      expect(new TextDecoder().decode(res)).to.eql(stringify(json));
    });

    it('binary', async () => {
      const path = PATH.TREE;
      const stream = fs.createReadStream(path) as unknown as ReadableStream;
      const res = await Stream.toUint8Array(stream);
      const file = Uint8Array.from(await fs.readFile(path));
      expect(res).to.eql(file);
    });
  });

  describe('save', () => {
    const testJson = async (input: t.Json) => {
      const path = fs.join(PATH.TMP, 'save.json');
      await Stream.save(path, input);

      const json = await fs.readJson(path);
      expect(json).to.eql(input);
    };

    it('binary', async () => {
      const path = {
        source: PATH.TREE,
        target: fs.join(PATH.TMP, 'save.png'),
      };
      const stream = fs.createReadStream(path.source) as unknown as ReadableStream;

      await Stream.save(path.target, stream);

      const file = {
        source: await fs.readFile(path.source),
        target: await fs.readFile(path.target),
      };

      expect(file.source.buffer).to.eql(file.target.buffer);
    });

    it('json: object', async () => {
      await testJson({});
      await testJson({ foo: 123 });
    });

    it('json: array', async () => {
      await testJson([]);
      await testJson([1, 2, 3]);
      await testJson({ msg: 'hello' });
    });

    it('json: string', async () => {
      await testJson('');
      await testJson('hello!');
    });

    it('json: number', async () => {
      await testJson(1234);
    });

    it('json: boolean', async () => {
      await testJson(true);
      await testJson(false);
    });

    it('json: null', async () => {
      await testJson(null);
    });

    it('throw: undefined', async () => {
      await expectError(() => testJson(undefined), 'No data');
    });
  });
});
