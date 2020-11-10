import { t, expect, util, PATH, init } from '../test';
import { local } from '.';

describe('fs.local', () => {
  beforeEach(async () => await util.reset());

  it('local.init({ dir, fs })', () => {
    const root = util.fs.resolve('tmp');
    const fs = local.init({ dir: root, fs: util.fs });
    expect(fs.dir).to.eql(root);
  });

  it('type', () => {
    const fs = init();
    expect(fs.type).to.eql('LOCAL');
  });

  describe('paths', () => {
    it('exposes root (dir)', () => {
      const fs = init();
      expect(fs.dir).to.eql(PATH.LOCAL);
    });

    it('resolve (uri => path)', () => {
      const fs = init();
      const test = (uri: string, expected: string) => {
        const res = fs.resolve(uri);
        expect(res.path).to.eql(`${PATH.LOCAL}/${expected}`);
        expect(res.props).to.eql({}); // NB: only relevant for S3 (pre-signed POST).
      };
      test('file:foo:123', 'ns.foo/123');
      test('file:ck3jldh1z00043fetc11ockko:1z53tcj', 'ns.ck3jldh1z00043fetc11ockko/1z53tcj');
    });

    it('resolve: SIGNED/post', () => {
      const fs = init();

      const res1 = fs.resolve('file:foo:123', { type: 'SIGNED/post' });
      const res2 = fs.resolve('file:foo:123', { type: 'SIGNED/post', contentType: 'image/png' });

      expect(res1.path).to.eql('/local/fs');
      expect(res2.path).to.eql(res1.path);

      expect(res1.props['content-type']).to.eql('application/octet-stream');
      expect(res2.props['content-type']).to.eql('image/png');

      expect(res1.props.key).to.match(/tmp\/local\/ns.foo\/123$/);
      expect(res2.props.key).to.eql(res1.props.key);
    });

    it('resolve - throws if non-DEFAULT operation specified', () => {
      const fs = init();
      const test = (options: t.IFsResolveArgs) => {
        const fn = () => fs.resolve('file:foo:123', options);
        expect(fn).to.throw();
      };
      test({ type: 'SIGNED/get' });
      test({ type: 'SIGNED/put' });
    });
  });

  it('info', async () => {
    const fs = init();

    const png = await util.image('bird.png');
    const uri = 'file:foo:bird';
    const path = fs.resolve(uri).path;
    await util.writeFile(path, png);

    const res = await fs.info(uri);
    expect(res.uri).to.eql(uri);
    expect(res.exists).to.eql(true);
    expect(res.bytes).to.greaterThan(-1);
    expect(res.hash).to.match(/^sha256-/);
  });

  it('info (404)', async () => {
    const fs = init();
    const uri = 'file:foo:boo';
    const res = await fs.info(uri);

    expect(res.uri).to.eql(uri);
    expect(res.exists).to.eql(false);
    expect(res.bytes).to.eql(-1);
    expect(res.hash).to.eql('');
    expect(res.path).to.match(/ns.foo\/boo/);
  });

  describe('read/write', () => {
    it('read', async () => {
      const fs = init();

      const png = await util.image('bird.png');
      const uri = 'file:foo:bird';
      const path = fs.resolve(uri).path;
      await util.writeFile(path, png);

      const res = await fs.read(uri);
      const file = res.file as t.IFsFileData;

      expect(res.uri).to.eql(uri);
      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.error).to.eql(undefined);
      expect(file.location).to.eql(`file://${file.path}`);
      expect(file.path).to.eql(path);
      expect(file.data.toString()).to.eql((await util.fs.readFile(file.path)).toString());
      expect(file.hash).to.match(/^sha256-[a-z0-9]+/);
    });

    it('write', async () => {
      const fs = init();

      const png = await util.image('bird.png');
      const uri = 'file:foo:bird';
      const res = await fs.write(`  ${uri} `, png); // NB: URI padded with spaces (corrected internally).
      const file = res.file;

      expect(res.uri).to.eql(uri);
      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.error).to.eql(undefined);
      expect(file.location).to.eql(`file://${file.path}`);
      expect(file.path).to.eql(fs.resolve(uri).path);
      expect(file.hash).to.match(/^sha256-[a-z0-9]+/);
      expect(png.toString()).to.eql((await util.fs.readFile(file.path)).toString());
    });

    it('delete (one)', async () => {
      const fs = init();

      const png = await util.image('bird.png');
      const uri = 'file:foo:bird';
      const path = fs.resolve(uri).path;

      expect(await util.pathExists(path)).to.eql(false);
      await fs.write(uri, png);
      expect(await util.pathExists(path)).to.eql(true);

      const res = await fs.delete(uri);
      expect(await util.pathExists(path)).to.eql(false);

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.uris).to.eql([uri]);
      expect(res.locations[0]).to.eql(`file://${path}`);
    });

    it('delete (many)', async () => {
      const fs = init();

      const png = await util.image('bird.png');
      const jpg = await util.image('kitten.jpg');
      const uri1 = 'file:foo:bird';
      const uri2 = 'file:foo:kitten';
      const path1 = fs.resolve(uri1).path;
      const path2 = fs.resolve(uri2).path;

      expect(await util.pathExists(path1)).to.eql(false);
      expect(await util.pathExists(path2)).to.eql(false);

      await fs.write(uri1, png);
      await fs.write(uri2, jpg);
      expect(await util.pathExists(path1)).to.eql(true);
      expect(await util.pathExists(path2)).to.eql(true);

      const res = await fs.delete([uri1, uri2]);

      expect(await util.pathExists(path1)).to.eql(false);
      expect(await util.pathExists(path2)).to.eql(false);

      expect(res.ok).to.eql(true);
      expect(res.status).to.eql(200);
      expect(res.uris).to.eql([uri1, uri2]);
      expect(res.locations[0]).to.eql(`file://${path1}`);
      expect(res.locations[1]).to.eql(`file://${path2}`);
    });
  });

  describe('copy', () => {
    it('copy file', async () => {
      const fs = init();
      const png = await util.image('bird.png');
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
      const fs = init();
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
    it('404 while reading file', async () => {
      const fs = init();
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
  });
});
