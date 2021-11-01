import { t, expect, TestUtil, PATH, Hash } from '../test';
import { FsDriverLocal } from '.';
import { createReadStream } from 'fs';

const nodefs = TestUtil.node;

describe('FsDriver.Local (node-js)', () => {
  beforeEach(() => TestUtil.reset());

  it('init', () => {
    const root = nodefs.resolve('tmp');
    const fs = FsDriverLocal({ dir: root, fs: nodefs });
    expect(fs.dir).to.eql(root);
  });

  it('type: LOCAL', () => {
    const fs = TestUtil.createLocal();
    expect(fs.type).to.eql('LOCAL');
  });

  describe('paths', () => {
    it('exposes root (dir)', () => {
      const fs = TestUtil.createLocal();
      expect(fs.dir).to.eql(PATH.LOCAL);
    });

    it('resolve (file:uri => path)', () => {
      const fs = TestUtil.createLocal();
      const test = (uri: string, expected: string) => {
        const res = fs.resolve(uri);
        expect(res.path).to.eql(`${PATH.LOCAL}/${expected}`);
        expect(res.props).to.eql({}); // NB: only relevant for S3 (pre-signed POST).
      };
      test('file:foo:123', 'ns.foo/123');
      test('file:ck3jldh1z00043fetc11ockko:1z53tcj', 'ns.ck3jldh1z00043fetc11ockko/1z53tcj');
    });

    it('resolve: SIGNED/post', () => {
      const fs = TestUtil.createLocal();

      const res1 = fs.resolve('file:foo:123', { type: 'SIGNED/post' });
      const res2 = fs.resolve('file:foo:123', { type: 'SIGNED/post', contentType: 'image/png' });

      expect(res1.path).to.eql('/local/fs');
      expect(res2.path).to.eql(res1.path);

      expect(res1.props['content-type']).to.eql('application/octet-stream');
      expect(res2.props['content-type']).to.eql('image/png');

      expect(res1.props.key).to.match(/tmp\/local\/ns.foo\/123$/);
      expect(res2.props.key).to.eql(res1.props.key);
    });

    it('resolve: throws if non-DEFAULT operation specified', () => {
      const fs = TestUtil.createLocal();
      const test = (options: t.IFsResolveOptionsLocal) => {
        const fn = () => fs.resolve('file:foo:123', options);
        expect(fn).to.throw();
      };
      test({ type: 'SIGNED/get' });
      test({ type: 'SIGNED/put' });
    });

    it('resolve: throw if not "path:.." or "file:.." URI', () => {
      const fs = TestUtil.createLocal();
      const fn = () => fs.resolve('foo');
      expect(fn).to.throw(/Invalid URI/);
    });

    it('resolve: to path', () => {
      const fs = TestUtil.createLocal();
      const test = (uri: string, expected: string) => {
        const path = fs.resolve(uri).path;
        expect(path).to.eql(nodefs.join(fs.dir, expected));
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

  describe('info', () => {
    it('file:uri', async () => {
      const fs = TestUtil.createLocal();

      const png = await TestUtil.readImage('bird.png');
      const uri = 'file:foo:bird';
      const path = fs.resolve(`  ${uri} `).path;
      await TestUtil.writeFile(path, png);

      const res = await fs.info(uri);
      expect(res.uri).to.eql(uri);
      expect(res.exists).to.eql(true);
      expect(res.bytes).to.greaterThan(-1);
      expect(res.hash).to.match(/^sha256-/);

      expect(res.location.startsWith('file:///Users')).to.eql(true);
      expect(res.location.endsWith('ns.foo/bird')).to.eql(true);
    });

    it('path:uri', async () => {
      const fs = TestUtil.createLocal();

      const png = await TestUtil.readImage('bird.png');
      const uri = 'path:foo/bird.png';
      const path = fs.resolve(uri).path;
      await TestUtil.writeFile(path, png);

      const res = await fs.info(` ${uri}  `);
      expect(res.uri).to.eql(uri);
      expect(res.exists).to.eql(true);
    });

    it('kind: "file" ', async () => {
      const fs = TestUtil.createLocal();
      const png = await TestUtil.readImage('bird.png');
      await TestUtil.writeFile(fs.resolve('path:foo/bird.png').path, png);

      const res = await fs.info('path:foo/bird.png');
      expect(res.exists).to.eql(true);
      expect(res.kind).to.eql('file');
      expect(res.bytes).to.greaterThan(-1);
      expect(res.hash).to.match(/^sha256-/);
    });

    it('kind:  "dir"', async () => {
      const fs = TestUtil.createLocal();
      const png = await TestUtil.readImage('bird.png');
      await TestUtil.writeFile(fs.resolve('path:foo/bird.png').path, png);

      const res = await fs.info('path:foo');
      expect(res.exists).to.eql(true);
      expect(res.kind).to.eql('dir');
      expect(res.bytes).to.eql(-1);
      expect(res.hash).to.eql('');
    });

    it('not found (404)', async () => {
      const fs = TestUtil.createLocal();
      const uri = 'file:foo:boo';
      const res = await fs.info(uri);

      expect(res.uri).to.eql(uri);
      expect(res.exists).to.eql(false);
      expect(res.bytes).to.eql(-1);
      expect(res.hash).to.eql('');
      expect(res.path).to.match(/ns.foo\/boo/);
    });
  });

  describe('read/write', () => {
    it('read (binary)', async () => {
      const fs = TestUtil.createLocal();

      const test = async (uri: string) => {
        const png = await TestUtil.readImage('bird.png');
        const path = fs.resolve(uri).path;
        await TestUtil.writeFile(path, png);

        const res = await fs.read(uri);
        const file = res.file as t.IFsFileData;

        expect(res.uri).to.eql(uri);
        expect(res.ok).to.eql(true);
        expect(res.status).to.eql(200);
        expect(res.error).to.eql(undefined);
        expect(file.location).to.eql(`file://${file.path}`);
        expect(file.path).to.eql(path);

        const compare = await nodefs.readFile(file.path);
        expect(file.data).to.eql(compare);
        expect(file.hash).to.eql(Hash.sha256(new Uint8Array(compare)));
      };

      await test('file:foo:123');
      await test('path:foo/bar/bird.png');
    });

    it('write (binary)', async () => {
      const fs = TestUtil.createLocal();

      const test = async (uri: string) => {
        const png = await TestUtil.readImage('bird.png');
        const res = await fs.write(`  ${uri} `, png); // NB: URI padded with spaces (corrected internally).
        const file = res.file;

        expect(res.uri).to.eql(uri);
        expect(res.ok).to.eql(true);
        expect(res.status).to.eql(200);
        expect(res.error).to.eql(undefined);
        expect(file.location).to.eql(`file://${file.path}`);
        expect(file.path).to.eql(fs.resolve(uri).path);
        expect(file.hash).to.match(/^sha256-[a-z0-9]+/);
        expect(file.data).to.eql(Uint8Array.from(await nodefs.readFile(file.path)));
      };

      await test('file:foo:123');
      await test('path:foo/bar/bird.png');
    });

    it('read/write string (TextEncoder | TextDecoder)', async () => {
      const fs = TestUtil.createLocal();

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

    it('write (stream)', async () => {
      const fs = TestUtil.createLocal();

      const srcPath = nodefs.resolve('static.test/images/bird.png');
      const srcFile = Uint8Array.from(await nodefs.readFile(srcPath));
      const srcHash = Hash.sha256(srcFile);
      const stream = createReadStream(srcPath);

      const uri = 'path:file.png';
      const write = await fs.write(uri, stream as any);

      expect(write.status).to.eql(200);
      expect(write.file.hash).to.eql(srcHash);
      expect(write.file.bytes).to.eql(srcFile.byteLength);
      expect(write.file.data).to.eql(srcFile);

      const read = await fs.read(uri);

      expect(read.status).to.eql(200);
      expect(read.uri).to.eql(uri);
      expect(read.file?.data).to.eql(srcFile);
      expect(read.file?.hash).to.eql(srcHash);
    });
  });

  describe('delete', () => {
    it('delete (one)', async () => {
      const fs = TestUtil.createLocal();

      const test = async (uri: string) => {
        const png = await TestUtil.readImage('bird.png');
        const path = fs.resolve(uri).path;

        expect(await TestUtil.pathExists(path)).to.eql(false);
        await fs.write(uri, png);
        expect(await TestUtil.pathExists(path)).to.eql(true);

        const res = await fs.delete(uri);
        expect(await TestUtil.pathExists(path)).to.eql(false);

        expect(res.ok).to.eql(true);
        expect(res.status).to.eql(200);
        expect(res.uris).to.eql([uri]);
        expect(res.locations[0]).to.eql(`file://${path}`);
      };

      await test('file:foo:123');
      await test('path:foo/bar/bird.png');
    });

    it('delete (many)', async () => {
      const fs = TestUtil.createLocal();

      const test = async (uri1: string, uri2: string) => {
        const png = await TestUtil.readImage('bird.png');
        const jpg = await TestUtil.readImage('kitten.jpg');
        const path1 = fs.resolve(uri1).path;
        const path2 = fs.resolve(uri2).path;

        expect(await TestUtil.pathExists(path1)).to.eql(false);
        expect(await TestUtil.pathExists(path2)).to.eql(false);

        await fs.write(uri1, png);
        await fs.write(uri2, jpg);
        expect(await TestUtil.pathExists(path1)).to.eql(true);
        expect(await TestUtil.pathExists(path2)).to.eql(true);

        const res = await fs.delete([uri1, uri2]);

        expect(await TestUtil.pathExists(path1)).to.eql(false);
        expect(await TestUtil.pathExists(path2)).to.eql(false);

        expect(res.ok).to.eql(true);
        expect(res.status).to.eql(200);
        expect(res.uris).to.eql([uri1, uri2]);
        expect(res.locations[0]).to.eql(`file://${path1}`);
        expect(res.locations[1]).to.eql(`file://${path2}`);
      };

      await test('file:foo:123', 'file:foo:456');
      await test('path:foo/bird.png', 'path:foo/kitten.jpg');
      await test('path:foo/bird.png', 'file:foo:123');
    });
  });

  describe('copy', () => {
    it('copy file', async () => {
      const fs = TestUtil.createLocal();
      const png = await TestUtil.readImage('bird.png');
      const sourceUri = 'file:foo:bird1';
      const targetUri = 'file:bar:bird2';

      expect((await fs.read(targetUri)).status).to.eql(404);

      await fs.write(sourceUri, png);
      const res = await fs.copy(sourceUri, targetUri);

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.source).to.eql('file:foo:bird1');
      expect(res.target).to.eql('file:bar:bird2');
      expect(res.error).to.eql(undefined);

      expect((await fs.read(targetUri)).status).to.eql(200);
    });

    it('error: source file does not exist', async () => {
      const fs = TestUtil.createLocal();
      const sourceUri = 'file:foo:bird1';
      const targetUri = 'file:bar:bird2';

      const res = await fs.copy(sourceUri, targetUri);

      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(500);
      expect(res.error?.type).to.eql('FS/copy');
      expect(res.error?.message).to.include(
        'Failed to copy from [file:foo:bird1] to [file:bar:bird2]',
      );
    });
  });

  describe('errors', () => {
    it('fail: 404 while reading file', async () => {
      const fs = TestUtil.createLocal();
      const uri = 'file:foo:noexist';

      const res = await fs.read(uri);
      const error = res.error as t.IFsError;

      expect(res.uri).to.eql(uri);
      expect(res.ok).to.eql(false);
      expect(res.status).to.eql(404);
      expect(res.file).to.eql(undefined);
      expect(error.type).to.eql('FS/read');
      expect(error.path).to.eql(fs.resolve(uri).path);
      expect(error.message).to.contain(`[file:foo:noexist] does not exist`);
    });

    it('fail: step up above root dir', async () => {
      const fs = TestUtil.createLocal();
      const png = await TestUtil.readImage('bird.png');

      const res1 = await fs.write('path:foo/bird.png', png);
      const res2 = await fs.write('path:foo/../../bird.png', png);

      expect(res1.error).to.eql(undefined);
      expect(res2.error?.message).to.include('Failed to write');
    });
  });
});
