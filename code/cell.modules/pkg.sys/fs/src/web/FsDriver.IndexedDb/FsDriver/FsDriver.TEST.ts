import { FsDriverLocal } from '..';
import { expect, Test, TestIndexedDb, TestFilesystem } from '../../test';
import { Hash, Path, slug, Stream, t } from '../common';

export default Test.describe('FsDriver (IndexedDB)', (e) => {
  const testCreate = async () => {
    const id = TestFilesystem.id;
    const fs = await FsDriverLocal({ id });

    const data = new Uint8Array([1, 2, 3]);
    const sample = { data, hash: Hash.sha256(data), bytes: data.byteLength };

    return { fs, sample };
  };

  e.it('type: LOCAL', async () => {
    const { fs } = await testCreate();
    expect(fs.driver.type).to.eql('LOCAL');
    fs.dispose();
  });

  e.describe('paths', (e) => {
    e.it('exposes root (dir)', async (e) => {
      const { fs } = await testCreate();
      expect(fs.driver.dir).to.eql('/'); // NB: Not part of a wider file-system.
      fs.dispose();
    });

    e.it('resolve (file:uri => path)', async () => {
      const { fs } = await testCreate();
      const test = (uri: string, expected: string) => {
        const res = fs.driver.resolve(uri);
        expect(res.path).to.eql(expected);
        expect(res.props).to.eql({}); // NB: only relevant for S3 (pre-signed POST).
      };
      test('file:foo:123', '/ns.foo/123');
      test('file:ck3jldh1z00043fetc11ockko:1z53tcj', '/ns.ck3jldh1z00043fetc11ockko/1z53tcj');
      fs.dispose();
    });

    e.it('resolve: SIGNED/post', async () => {
      const { fs } = await testCreate();

      const res1 = fs.driver.resolve('file:foo:123', { type: 'SIGNED/post' });
      const res2 = fs.driver.resolve('file:foo:123', {
        type: 'SIGNED/post',
        contentType: 'image/png',
      });

      expect(res1.path).to.eql('/local/fs');
      expect(res2.path).to.eql(res1.path);

      expect(res1.props['content-type']).to.eql('application/octet-stream');
      expect(res2.props['content-type']).to.eql('image/png');

      expect(res1.props.key).to.match(/\/ns.foo\/123$/);
      expect(res2.props.key).to.eql(res1.props.key);

      fs.dispose();
    });

    e.it('resolve: throws if non-DEFAULT operation specified', async () => {
      const { fs } = await testCreate();
      const test = (options: t.IFsResolveOptionsLocal) => {
        const fn = () => fs.driver.resolve('file:foo:123', options);
        expect(fn).to.throw();
      };
      test({ type: 'SIGNED/get' });
      test({ type: 'SIGNED/put' });

      fs.dispose();
    });

    e.it('resolve: throw if not "path:.." or "file:.." URI', async () => {
      const { fs } = await testCreate();
      const fn = () => fs.driver.resolve('foo');
      expect(fn).to.throw(/Invalid URI/);

      fs.dispose();
    });

    e.it('resolve: to path', async () => {
      const { fs } = await testCreate();
      const test = (uri: string, expected: string) => {
        const path = fs.driver.resolve(uri).path;
        expect(path).to.eql(Path.join(fs.driver.dir, expected));
      };

      test('path:foo', 'foo');
      test('path:/foo', 'foo');
      test('path:///foo', 'foo');
      test('path:', '/');
      test('path:/', '/');
      test('path:///', '/');
      test('path:./foo', 'foo');
      test('path:../foo', '/');
      test('path:foo/../../bar', '/'); // NB: Does not step above root directory.
      test('path:./foo/../..', '/'); //   NB: Does not step above root directory.

      fs.dispose();
    });
  });

  e.describe('info', (e) => {
    e.it('file:uri', async () => {
      const { fs, sample } = await testCreate();
      const png = sample.data;
      const uri = 'file:foo:bird';
      await fs.driver.write(uri, png);

      const res = await fs.driver.info(uri);

      expect(res.uri).to.eql(uri);
      expect(res.exists).to.eql(true);
      expect(res.bytes).to.greaterThan(-1);
      expect(res.hash).to.equal(sample.hash);
      expect(res.location.startsWith('file:///ns.foo')).to.eql(true);
      expect(res.location.endsWith('ns.foo/bird')).to.eql(true);

      fs.dispose();
    });

    e.it('path:uri', async () => {
      const { fs, sample } = await testCreate();
      const png = sample.data;
      const uri = 'path:foo/bird.png';
      await fs.driver.write(uri, png);

      const res = await fs.driver.info(` ${uri}  `);
      expect(res.uri).to.eql(uri);
      expect(res.exists).to.eql(true);

      fs.dispose();
    });

    e.it('kind: "file"', async () => {
      const { fs, sample } = await testCreate();
      const uri = 'path:foo/bird.png';
      await fs.driver.write(uri, sample.data);

      const res = await fs.driver.info('path:foo/bird.png');
      expect(res.exists).to.eql(true);
      expect(res.kind).to.eql('file');
      expect(res.bytes).to.eql(sample.bytes);
      expect(res.hash).to.eql(sample.hash);

      fs.dispose();
    });

    e.it('kind: "dir"', async () => {
      const { fs, sample } = await testCreate();
      const uri = 'path:foo/bird.png';
      await fs.driver.write(uri, sample.data);

      const test = async (uri: string) => {
        const res = await fs.driver.info(uri);
        expect(res.uri).to.eql(uri);
        expect(res.exists).to.eql(true);
        expect(res.kind).to.eql('dir');
        expect(res.bytes).to.eql(-1);
        expect(res.hash).to.eql('');
      };

      await test('path:foo/');
      await test('path:foo');

      fs.dispose();
    });

    e.it('not found (404)', async () => {
      const { fs } = await testCreate();
      const uri = 'file:foo:boo';
      const res = await fs.driver.info(uri);
      expect(res.uri).to.eql(uri);
      expect(res.exists).to.eql(false);
      expect(res.bytes).to.eql(-1);
      expect(res.hash).to.eql('');
      expect(res.path).to.match(/ns.foo\/boo/);

      fs.dispose();
    });
  });

  e.describe('read/write', (e) => {
    e.it('read: binary (Uint8Array)', async () => {
      const { fs, sample } = await testCreate();

      const test = async (uri: string) => {
        const path = fs.driver.resolve(uri).path;
        await fs.driver.write(uri, sample.data);

        const res = await fs.driver.read(` ${uri} `);
        const file = res.file as t.IFsFileData;

        expect(res.uri).to.eql(uri);
        expect(res.ok).to.eql(true);
        expect(res.status).to.eql(200);
        expect(res.error).to.eql(undefined);
        expect(file.location).to.eql(`file://${file.path}`);
        expect(file.path).to.eql(path);

        expect(file.data).to.eql(sample.data);
        expect(file.hash).to.eql(sample.hash);
      };

      await test('file:foo:123');
      await test('path:foo/bar/bird.png');

      fs.dispose();
    });

    e.it('write: binary (Uint8Array)', async () => {
      const { fs, sample } = await testCreate();

      const test = async (uri: string) => {
        const res = await fs.driver.write(`  ${uri} `, sample.data); // NB: URI padded with spaces (corrected internally).
        const file = res.file;

        expect(res.uri).to.eql(uri);
        expect(res.ok).to.eql(true);
        expect(res.status).to.eql(200);
        expect(res.error).to.eql(undefined);
        expect(file.location).to.eql(`file://${file.path}`);
        expect(file.path).to.eql(fs.driver.resolve(uri).path);
        expect(file.hash).to.match(/^sha256-[a-z0-9]+/);
        expect(file.data).to.eql(sample.data);
      };

      await test('file:foo:123');
      await test('path:foo/bar/bird.png');

      fs.dispose();
    });

    e.it('read/write: "string" (TextEncoder | TextDecoder)', async () => {
      const { fs } = await testCreate();

      const uri = 'path:file.txt';
      const text = 'hello world!';
      const data = new TextEncoder().encode(text);

      const write = await fs.driver.write(uri, data);
      const read = await fs.driver.read(uri);

      expect(write.file.hash).to.eql(Hash.sha256(data));
      expect(write.file.bytes).to.eql(data.byteLength);

      expect(read.file?.data).to.eql(data);
      expect(read.file?.hash).to.eql(Hash.sha256(data));
      expect(read.file?.bytes).to.eql(data.byteLength);
      expect(new TextDecoder().decode(read.file?.data)).to.eql(text);

      fs.dispose();
    });

    e.it('step up path navigation ("../..")', async () => {
      const { fs, sample } = await testCreate();

      const root = slug();
      const path = `/${root}/zoo/file.txt`;
      const uri = `path:${root}/bar/baz/../../zoo/file.txt`;
      const res = await fs.driver.write(uri, sample.data);

      expect(res.file.path).to.eql(path);
      expect((await fs.driver.info(`path:${path}`)).exists).to.eql(true);

      fs.dispose();
    });

    e.it('write (stream)', async () => {
      const { fs } = await testCreate();
      const path = 'static/test/foo.json';
      const uri = `path:foo/${path}`;

      const body = (await fetch(path)).body as ReadableStream;
      expect(Stream.isReadableStream(body)).to.eql(true);

      const res1 = await fs.driver.write(uri, body);
      const res2 = await fs.driver.read(uri);
      fs.dispose();

      const decode = (input?: Uint8Array) => new TextDecoder().decode(input);

      expect(decode(res1.file.data)).to.include('"name": "foo"');
      expect(decode(res2.file?.data)).to.include('"name": "foo"');
    });

    e.it('write (replace)', async () => {
      const test = await TestIndexedDb.create(TestFilesystem.id);
      await test.deleteAll();
      const { fs } = await testCreate();

      const encode = (text: string) => new TextEncoder().encode(text);
      const uri = 'path:file.txt';

      const write1 = await fs.driver.write(uri, encode('hello'));
      const records1 = await test.getAll();
      expect(records1.paths.length).to.eql(1);
      expect(records1.files.length).to.eql(1);

      const write2 = await fs.driver.write(uri, encode('world'));
      const records2 = await test.getAll();
      expect(records2.paths.length).to.eql(1);
      expect(records2.files.length).to.eql(1); // NB: Still only a single file.

      expect(write1.file.path).to.eql(write2.file.path);
      expect(write1.file.hash).to.not.eql(write2.file.hash);

      fs.dispose();
    });
  });

  e.describe('delete', (e) => {
    e.it('delete (one)', async () => {
      const { fs } = await testCreate();
      const data = new TextEncoder().encode(slug());

      const test = async (uri: string) => {
        const path = fs.driver.resolve(uri).path;

        expect((await fs.driver.info(uri)).exists).to.eql(false);
        await fs.driver.write(uri, data);
        expect((await fs.driver.info(uri)).exists).to.eql(true);

        const res = await fs.driver.delete(uri);
        expect((await fs.driver.info(uri)).exists).to.eql(false);

        expect(res.ok).to.eql(true);
        expect(res.status).to.eql(200);
        expect(res.uris).to.eql([uri]);
        expect(res.locations[0]).to.eql(`file://${path}`);
      };

      await test(`file:${slug()}:123`);
      await test(`path:${slug()}/bar/bird.png`);

      fs.dispose();
    });

    e.it('delete (one, with second path reference remaining)', async () => {
      const { fs } = await testCreate();
      const data = new TextEncoder().encode(slug());

      const uri1 = `path:${slug()}/file1.txt`;
      const uri2 = `path:${slug()}/file2.txt`;

      await fs.driver.write(uri1, data);
      await fs.driver.write(uri2, data);

      expect((await fs.driver.info(uri1)).exists).to.eql(true);
      expect((await fs.driver.info(uri2)).exists).to.eql(true);

      await fs.driver.delete(uri1);
      expect((await fs.driver.info(uri1)).exists).to.eql(false);
      expect((await fs.driver.info(uri2)).exists).to.eql(true);

      await fs.driver.delete(uri2);
      expect((await fs.driver.info(uri1)).exists).to.eql(false);
      expect((await fs.driver.info(uri2)).exists).to.eql(false);

      fs.dispose();
    });

    e.it('delete (many)', async () => {
      const { fs } = await testCreate();

      const test = async (uri1: string, uri2: string) => {
        const png = new TextEncoder().encode(slug());
        const jpg = new TextEncoder().encode(slug());

        const path1 = fs.driver.resolve(uri1).path;
        const path2 = fs.driver.resolve(uri2).path;

        expect((await fs.driver.info(uri1)).exists).to.eql(false);
        expect((await fs.driver.info(uri2)).exists).to.eql(false);

        await fs.driver.write(uri1, png);
        await fs.driver.write(uri2, jpg);
        expect((await fs.driver.info(uri1)).exists).to.eql(true);
        expect((await fs.driver.info(uri2)).exists).to.eql(true);

        const res = await fs.driver.delete([uri1, uri2]);

        expect((await fs.driver.info(uri1)).exists).to.eql(false);
        expect((await fs.driver.info(uri2)).exists).to.eql(false);

        expect(res.ok).to.eql(true);
        expect(res.status).to.eql(200);
        expect(res.uris).to.eql([uri1, uri2]);
        expect(res.locations[0]).to.eql(`file://${path1}`);
        expect(res.locations[1]).to.eql(`file://${path2}`);
      };

      await test(`file:${slug()}:123`, `file:${slug()}:456`);
      await test(`path:${slug()}/bird.png`, `path:${slug()}/kitten.jpg`);
      await test(`path:${slug()}/bird.png`, `file:${slug()}:123`);

      fs.dispose();
    });
  });

  e.describe('copy', (e) => {
    e.it('copy file', async () => {
      const { fs, sample } = await testCreate();
      const sourceUri = `file:${slug()}:bird1`;
      const targetUri = `path:${slug()}/foo.png`;

      expect((await fs.driver.read(targetUri)).status).to.eql(404);

      await fs.driver.write(sourceUri, sample.data);
      const res = await fs.driver.copy(sourceUri, targetUri);

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.source).to.eql(sourceUri);
      expect(res.target).to.eql(targetUri);
      expect(res.error).to.eql(undefined);

      expect((await fs.driver.read(targetUri)).status).to.eql(200);
      expect((await fs.driver.read(targetUri)).file?.data).to.eql(sample.data);

      fs.dispose();
    });

    e.it('error: source file does not exist', async () => {
      const { fs } = await testCreate();
      const sourceUri = `file:${slug()}:bird1`;
      const targetUri = `path:${slug()}/foo.png`;

      const res = await fs.driver.copy(sourceUri, targetUri);

      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(500);
      expect(res.error?.type).to.eql('FS/copy');
      expect(res.error?.message).to.include(`Failed to copy from [${sourceUri}] to [${targetUri}]`);
      expect(res.error?.message).to.include(`Source file does not exist`);

      fs.dispose();
    });
  });

  e.describe('errors', (e) => {
    e.it('fail: 404 while reading file', async () => {
      const { fs } = await testCreate();

      const uri = 'file:foo:noexist';
      const res = await fs.driver.read(` ${uri} `);
      const error = res.error as t.IFsError;

      expect(res.uri).to.eql(uri);
      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(404);
      expect(res.file).to.eql(undefined);
      expect(error.type).to.eql('FS/read');
      expect(error.path).to.eql(fs.driver.resolve(uri).path);
      expect(error.message).to.contain(`[file:foo:noexist] does not exist`);

      fs.dispose();
    });

    e.it('fail: step up above root dir', async () => {
      const { fs, sample } = await testCreate();
      const png = sample.data;

      const res1 = await fs.driver.write('path:foo/bird.png', png);
      const res2 = await fs.driver.write('path:foo/../../bird.png', png);

      expect(res1.error).to.eql(undefined);
      expect(res2.error?.message).to.include('Failed to write');
      expect(res2.error?.message).to.include('Path out of scope');

      fs.dispose();
    });

    e.it('exception: no data', async () => {
      const { fs } = await testCreate();
      let message = '';
      try {
        await fs.driver.write('path:foo/bird.png', undefined as any);
      } catch (err: any) {
        message = err.message;
      }
      expect(message).to.include('No data');

      fs.dispose();
    });
  });
});
