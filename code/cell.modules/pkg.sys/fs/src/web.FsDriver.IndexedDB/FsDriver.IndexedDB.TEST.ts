import { expect } from 'chai';
import { Test } from 'sys.ui.dev';

import { FsDriverIndexedDB } from '.';
import { Hash, Path, slug, t } from './common';

export default Test.describe('FsDriver.IndexedDb', (e) => {
  const testCreate = async () => {
    const name = 'test.foo';
    const db = await FsDriverIndexedDB({ name });
    const fs = db.driver;

    const data = new Uint8Array([1, 2, 3]);
    const sample = { data, hash: Hash.sha256(data), bytes: data.byteLength };

    return { db, fs, name, sample };
  };

  e.it('type: LOCAL', async () => {
    const { fs } = await testCreate();
    expect(fs.type).to.eql('LOCAL');
  });

  e.describe('paths', (e) => {
    e.it('exposes root (dir)', async (e) => {
      const { fs } = await testCreate();
      expect(fs.dir).to.eql('/'); // NB: Not part of a wider file-system.
    });

    e.it('resolve (file:uri => path)', async () => {
      const { fs } = await testCreate();
      const test = (uri: string, expected: string) => {
        const res = fs.resolve(uri);
        expect(res.path).to.eql(expected);
        expect(res.props).to.eql({}); // NB: only relevant for S3 (pre-signed POST).
      };
      test('file:foo:123', '/ns.foo/123');
      test('file:ck3jldh1z00043fetc11ockko:1z53tcj', '/ns.ck3jldh1z00043fetc11ockko/1z53tcj');
    });

    e.it('resolve: SIGNED/post', async () => {
      const { fs } = await testCreate();

      const res1 = fs.resolve('file:foo:123', { type: 'SIGNED/post' });
      const res2 = fs.resolve('file:foo:123', { type: 'SIGNED/post', contentType: 'image/png' });

      expect(res1.path).to.eql('/local/fs');
      expect(res2.path).to.eql(res1.path);

      expect(res1.props['content-type']).to.eql('application/octet-stream');
      expect(res2.props['content-type']).to.eql('image/png');

      expect(res1.props.key).to.match(/\/ns.foo\/123$/);
      expect(res2.props.key).to.eql(res1.props.key);
    });

    e.it('resolve: throws if non-DEFAULT operation specified', async () => {
      const { fs } = await testCreate();
      const test = (options: t.IFsResolveOptionsLocal) => {
        const fn = () => fs.resolve('file:foo:123', options);
        expect(fn).to.throw();
      };
      test({ type: 'SIGNED/get' });
      test({ type: 'SIGNED/put' });
    });

    e.it('resolve: throw if not "path:.." or "file:.." URI', async () => {
      const { fs } = await testCreate();
      const fn = () => fs.resolve('foo');
      expect(fn).to.throw(/Invalid URI/);
    });

    e.it('resolve: to path', async () => {
      const { fs } = await testCreate();
      const test = (uri: string, expected: string) => {
        const path = fs.resolve(uri).path;
        expect(path).to.eql(Path.join(fs.dir, expected));
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
    });
  });

  e.describe('info', (e) => {
    e.it('file:uri', async () => {
      const { fs, sample } = await testCreate();
      const png = sample.data;
      const uri = 'file:foo:bird';
      await fs.write(uri, png);

      const res = await fs.info(uri);

      expect(res.uri).to.eql(uri);
      expect(res.exists).to.eql(true);
      expect(res.bytes).to.greaterThan(-1);
      expect(res.hash).to.equal(sample.hash);
      expect(res.location.startsWith('file:///ns.foo')).to.eql(true);
      expect(res.location.endsWith('ns.foo/bird')).to.eql(true);

      console.log('res', res);
    });

    e.it('path:uri', async () => {
      const { fs, sample } = await testCreate();
      const png = sample.data;
      const uri = 'path:foo/bird.png';
      await fs.write(uri, png);

      const res = await fs.info(` ${uri}  `);
      expect(res.uri).to.eql(uri);
      expect(res.exists).to.eql(true);

      console.log('res', res);
    });

    e.it('kind: "file"', async () => {
      const { fs, sample } = await testCreate();
      const uri = 'path:foo/bird.png';
      await fs.write(uri, sample.data);

      const res = await fs.info('path:foo/bird.png');
      expect(res.exists).to.eql(true);
      expect(res.kind).to.eql('file');
      expect(res.bytes).to.eql(sample.bytes);
      expect(res.hash).to.eql(sample.hash);
    });

    e.it('kind: "dir"', async () => {
      const { fs, sample } = await testCreate();
      const uri = 'path:foo/bird.png';
      await fs.write(uri, sample.data);

      const test = async (uri: string) => {
        const res = await fs.info(uri);
        expect(res.uri).to.eql(uri);
        expect(res.exists).to.eql(true);
        expect(res.kind).to.eql('dir');
        expect(res.bytes).to.eql(-1);
        expect(res.hash).to.eql('');
      };

      await test('path:foo/');
      await test('path:foo');
    });

    e.it('not found (404)', async () => {
      const { fs } = await testCreate();
      const uri = 'file:foo:boo';
      const res = await fs.info(uri);
      expect(res.uri).to.eql(uri);
      expect(res.exists).to.eql(false);
      expect(res.bytes).to.eql(-1);
      expect(res.hash).to.eql('');
      expect(res.path).to.match(/ns.foo\/boo/);
    });
  });

  e.describe('read/write', (e) => {
    e.it('read (binary)', async () => {
      const { fs, sample } = await testCreate();

      const test = async (uri: string) => {
        const path = fs.resolve(uri).path;
        await fs.write(uri, sample.data);

        const res = await fs.read(` ${uri} `);
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
    });

    e.it('write (binary)', async () => {
      const { fs, sample } = await testCreate();

      const test = async (uri: string) => {
        const res = await fs.write(`  ${uri} `, sample.data); // NB: URI padded with spaces (corrected internally).
        const file = res.file;

        expect(res.uri).to.eql(uri);
        expect(res.ok).to.eql(true);
        expect(res.status).to.eql(200);
        expect(res.error).to.eql(undefined);
        expect(file.location).to.eql(`file://${file.path}`);
        expect(file.path).to.eql(fs.resolve(uri).path);
        expect(file.hash).to.match(/^sha256-[a-z0-9]+/);
        expect(file.data).to.eql(sample.data);
      };

      await test('file:foo:123');
      await test('path:foo/bar/bird.png');
    });

    e.it('read/write string (TextEncoder | TextDecoder)', async () => {
      const { fs } = await testCreate();

      const uri = 'path:file.txt';
      const text = 'hello world!';
      const data = new TextEncoder().encode(text);

      const write = await fs.write(uri, data);
      const read = await fs.read(uri);

      expect(write.file.hash).to.eql(Hash.sha256(data));
      expect(write.file.bytes).to.eql(data.byteLength);

      expect(read.file?.data).to.eql(data);
      expect(read.file?.hash).to.eql(Hash.sha256(data));
      expect(read.file?.bytes).to.eql(data.byteLength);
      expect(new TextDecoder().decode(read.file?.data)).to.eql(text);
    });

    e.it.skip('write (stream)', async () => {
      const { fs, sample } = await testCreate();

      // const srcPath = nodefs.resolve('static.test/images/bird.png');
      // const srcFile = Uint8Array.from(await nodefs.readFile(srcPath));
      // const srcHash = Hash.sha256(srcFile);
      // const stream = createReadStream(srcPath);

      // const uri = 'path:file.png';
      // const write = await fs.write(uri, stream as any);

      // expect(write.status).to.eql(200);
      // expect(write.file.hash).to.eql(srcHash);
      // expect(write.file.bytes).to.eql(srcFile.byteLength);
      // expect(write.file.data).to.eql(srcFile);

      // const read = await fs.read(uri);

      // expect(read.status).to.eql(200);
      // expect(read.uri).to.eql(uri);
      // expect(read.file?.data).to.eql(srcFile);
      // expect(read.file?.hash).to.eql(srcHash);
    });
  });

  e.describe('delete', (e) => {
    e.it('delete (one)', async () => {
      const { fs } = await testCreate();
      const data = new TextEncoder().encode(slug());

      const test = async (uri: string) => {
        const path = fs.resolve(uri).path;

        expect((await fs.info(uri)).exists).to.eql(false);
        await fs.write(uri, data);
        expect((await fs.info(uri)).exists).to.eql(true);

        const res = await fs.delete(uri);
        expect((await fs.info(uri)).exists).to.eql(false);

        expect(res.ok).to.eql(true);
        expect(res.status).to.eql(200);
        expect(res.uris).to.eql([uri]);
        expect(res.locations[0]).to.eql(`file://${path}`);
      };

      await test(`file:${slug()}:123`);
      await test(`path:${slug()}/bar/bird.png`);
    });

    e.it('delete (one, with second path reference remaining)', async () => {
      const { fs } = await testCreate();
      const data = new TextEncoder().encode(slug());

      const uri1 = `path:${slug()}/file1.txt`;
      const uri2 = `path:${slug()}/file2.txt`;

      await fs.write(uri1, data);
      await fs.write(uri2, data);

      expect((await fs.info(uri1)).exists).to.eql(true);
      expect((await fs.info(uri2)).exists).to.eql(true);

      await fs.delete(uri1);
      expect((await fs.info(uri1)).exists).to.eql(false);
      expect((await fs.info(uri2)).exists).to.eql(true);

      await fs.delete(uri2);
      expect((await fs.info(uri1)).exists).to.eql(false);
      expect((await fs.info(uri2)).exists).to.eql(false);
    });

    e.it('delete (many)', async () => {
      const { fs } = await testCreate();

      const test = async (uri1: string, uri2: string) => {
        const png = new TextEncoder().encode(slug());
        const jpg = new TextEncoder().encode(slug());

        const path1 = fs.resolve(uri1).path;
        const path2 = fs.resolve(uri2).path;

        expect((await fs.info(uri1)).exists).to.eql(false);
        expect((await fs.info(uri2)).exists).to.eql(false);

        await fs.write(uri1, png);
        await fs.write(uri2, jpg);
        expect((await fs.info(uri1)).exists).to.eql(true);
        expect((await fs.info(uri2)).exists).to.eql(true);

        const res = await fs.delete([uri1, uri2]);

        expect((await fs.info(uri1)).exists).to.eql(false);
        expect((await fs.info(uri2)).exists).to.eql(false);

        expect(res.ok).to.eql(true);
        expect(res.status).to.eql(200);
        expect(res.uris).to.eql([uri1, uri2]);
        expect(res.locations[0]).to.eql(`file://${path1}`);
        expect(res.locations[1]).to.eql(`file://${path2}`);
      };

      await test(`file:${slug()}:123`, `file:${slug()}:456`);
      await test(`path:${slug()}/bird.png`, `path:${slug()}/kitten.jpg`);
      await test(`path:${slug()}/bird.png`, `file:${slug()}:123`);
    });
  });

  e.describe('copy', (e) => {
    e.it('copy file', async () => {
      const { fs, sample } = await testCreate();
      const sourceUri = `file:${slug()}:bird1`;
      const targetUri = `path:${slug()}/foo.png`;

      expect((await fs.read(targetUri)).status).to.eql(404);

      await fs.write(sourceUri, sample.data);
      const res = await fs.copy(sourceUri, targetUri);

      console.log('res', res);
      console.log('res.error', res.error);
      console.log('res.error', res.error?.message);

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.source).to.eql(sourceUri);
      expect(res.target).to.eql(targetUri);
      expect(res.error).to.eql(undefined);

      expect((await fs.read(targetUri)).status).to.eql(200);
      expect((await fs.read(targetUri)).file?.data).to.eql(sample.data);
    });

    e.it('error: source file does not exist', async () => {
      const { fs } = await testCreate();
      const sourceUri = `file:${slug()}:bird1`;
      const targetUri = `path:${slug()}/foo.png`;

      const res = await fs.copy(sourceUri, targetUri);

      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(500);
      expect(res.error?.type).to.eql('FS/copy');
      expect(res.error?.message).to.include(`Failed to copy from [${sourceUri}] to [${targetUri}]`);
      expect(res.error?.message).to.include(`Source file does not exist`);
    });
  });
});
