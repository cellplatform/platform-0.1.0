import { t, expect, fs, SampleBundles, Schema, ManifestHash } from '../../../test';
import { Manifest } from '.';

describe('Manifest', function () {
  this.timeout(99999);

  const TMP = fs.resolve('./tmp/test/FileManifest');
  const config = SampleBundles.simpleNode.config;
  const sourceDir = SampleBundles.simpleNode.paths.out.dist;

  before(async () => {
    const force = false;
    await SampleBundles.simpleNode.bundle({ force });
  });

  beforeEach(() => fs.remove(TMP));

  it('filename (default: index.json)', () => {
    expect(Manifest.filename).to.eql('index.json');
  });

  it('create (default)', async () => {
    const test = async (sourceDir: string) => {
      const manifest = await Manifest.create({ dir: sourceDir });
      const files = manifest.files;
      expect(manifest.hash.files).to.eql(Manifest.hash.files(files));
      expect(files.length).to.greaterThan(0);

      const expectEvery = (fn: (file: t.ManifestFile) => boolean) => {
        expect(files.every((file) => fn(file))).to.eql(true);
      };

      expectEvery((file) => file.filehash.startsWith('sha256-'));
      expectEvery((file) => file.bytes > 0);
      expectEvery((file) => file.path.length > 0);
      expectEvery((file) => file.public === undefined);
    };

    await test(sourceDir);
    await test(`${sourceDir}///`);
  });

  it('createAndSave', async () => {
    const path = fs.join(TMP, Manifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    const model = config.toObject();
    const res = await Manifest.createAndSave({ model, dir: TMP });
    expect(res.path).to.eql(path);

    const read = await Manifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(res.manifest);
  });

  describe('write', () => {
    it('write flag: public', async () => {
      const model = config.toObject();
      const manifest = await Manifest.create({ model, dir: sourceDir });

      const png = manifest.files.filter((file) => file.path.endsWith('.png'));
      const other = manifest.files.filter((file) => !file.path.endsWith('.png'));

      expect(png.length).to.greaterThan(1);
      expect(other.length).to.greaterThan(1);

      expect(png.every((file) => file.public === true)).to.eql(true);
      expect(other.every((file) => file.public === undefined)).to.eql(true);
    });

    it('writeFile => readFile', async () => {
      const model = config.toObject();
      const manifest = await Manifest.create({ model, dir: sourceDir });

      const path = fs.join(TMP, Manifest.filename);
      expect(await fs.pathExists(path)).to.eql(false);

      await Manifest.write({ manifest, dir: TMP });
      expect(await fs.pathExists(path)).to.eql(true);

      const read = await Manifest.read({ dir: TMP });
      expect(read.path).to.eql(path);
      expect(read.manifest).to.eql(manifest);
    });

    it('does not include manifest file within itself', async () => {
      const sourceDir = fs.join(TMP, 'src');
      const write = async (name: string) => {
        const path = fs.join(sourceDir, name);
        await fs.ensureDir(fs.dirname(path));
        await fs.writeFile(path, 'hello');
      };

      await write(Manifest.filename);
      await write('one.txt');
      await write('two.txt');
      await write(fs.join('foo', Manifest.filename)); // NB: Descendent file with the manifest name "index.json" is not excluded.

      const manifest = await Manifest.create({ dir: sourceDir });
      const files = manifest.files;

      expect(files.length).to.eql(3);
      expect(files.filter((file) => file.path === Manifest.filename).length).to.eql(0);
    });
  });

  describe('hash', () => {
    it('hash.files - [array]', () => {
      const file1: t.ManifestFile = { path: 'foo.txt', bytes: 1234, filehash: 'abc' };
      const file2: t.ManifestFile = { path: 'foo.txt', bytes: 1234, filehash: 'def' };
      const hash = Schema.Hash.sha256([file1.filehash, file2.filehash]);
      expect(Manifest.hash.files([file1, file2, undefined] as any)).to.eql(hash);
    });

    it('hash.files - {manifest}', async () => {
      const manifest = await Manifest.create({ dir: sourceDir });
      const hash = ManifestHash.files(manifest.files);
      expect(manifest.hash.files).to.eql(hash);
      expect(Manifest.hash.files(manifest)).to.eql(hash);
    });

    it('hash.filehash', async () => {
      const manifest = await Manifest.create({ dir: sourceDir });
      const filename = 'main.js';
      const file = manifest.files.find((file) => file.path === filename);
      const hash = await Manifest.hash.filehash(fs.join(sourceDir, filename));
      expect(hash).to.match(/^sha256-/);
      expect(hash).to.eql(file?.filehash);
    });
  });

  describe('validate', () => {
    const tmp = fs.resolve(TMP, 'validate');

    const prepare = async () => {
      await fs.remove(tmp);
      await fs.ensureDir(tmp);
      await fs.copy(fs.resolve(sourceDir), tmp);
    };

    it('ok', async () => {
      const manifest = await Manifest.create({ dir: sourceDir });
      const res = await Manifest.validate(sourceDir, manifest);

      expect(res.ok).to.eql(true);
      expect(res.dir).to.eql(fs.resolve(sourceDir));
      expect(res.errors).to.eql([]);
    });

    it('error: filehash changed', async () => {
      await prepare();
      const manifest = await Manifest.create({ dir: tmp });

      const filename = 'main.js';
      const file = manifest.files.find((file) => file.path === filename);
      const path = fs.resolve(fs.join(tmp, filename));

      await fs.writeFile(path, '// foobar change.');
      const res = await Manifest.validate(tmp, manifest);
      const hashAfterChange = await Manifest.hash.filehash(fs.join(tmp, filename));

      expect(res.ok).to.eql(false);
      expect(res.dir).to.eql(tmp);
      expect(res.errors.length).to.eql(1);

      const error = res.errors[0];
      expect(error.path).to.eql(filename);
      expect(error.hash.filesystem).to.eql(hashAfterChange);
      expect(error.hash.manifest).to.eql(file?.filehash);
      expect(error.message).to.include('Filehash mismatch');
    });

    it('error: filesystem - removed file', async () => {
      await prepare();
      const manifest = await Manifest.create({ dir: tmp });

      const res1 = await Manifest.validate(tmp, manifest);
      expect(res1.ok).to.eql(true);

      await fs.remove(fs.join(tmp, 'main.js'));
      const res2 = await Manifest.validate(tmp, manifest);

      expect(res2.ok).to.eql(false);
      expect(res2.dir).to.eql(tmp);
      expect(res2.errors.length).to.eql(1);

      const error = res2.errors[0];
      expect(error.hash).to.eql({ manifest: '-', filesystem: '-' });
      expect(error.path).to.eql('main.js');
      expect(error.message).to.include(
        `A file within the manifest has been removed from the file-system`,
      );
    });

    it('error: filesystem - added file', async () => {
      await prepare();
      const manifest = await Manifest.create({ dir: tmp });

      const res1 = await Manifest.validate(tmp, manifest);
      expect(res1.ok).to.eql(true);

      await fs.ensureDir(fs.join(tmp, 'foo'));
      await fs.writeFile(fs.join(tmp, 'foo/bar.txt'), 'Hello');
      const res2 = await Manifest.validate(tmp, manifest);

      expect(res2.ok).to.eql(false);
      expect(res2.dir).to.eql(tmp);
      expect(res2.errors.length).to.eql(1);

      const error = res2.errors[0];
      expect(error.hash).to.eql({ manifest: '-', filesystem: '-' });
      expect(error.path).to.eql('foo/bar.txt');
      expect(error.message).to.include(
        `A file not within the manifest has been added to the file-system`,
      );
    });
  });

  describe('image', () => {
    const getStatic = async () => {
      const model = config.toObject();
      const res = await Manifest.createAndSave({ model, dir: sourceDir });
      const manifest = res.manifest;
      const files = manifest.files.filter((file) => file.path.startsWith('static/'));
      return { manifest, model, files };
    };

    it('toImages', async () => {
      const { files } = await getStatic();

      const png = files.find((file) => file.path.endsWith('.png'));
      const path = png?.path || '';
      const res = await Manifest.toImage(path);

      expect(res?.kind).to.eql('png');
      expect(res?.width).to.eql(247);
      expect(res?.height).to.eql(245);
    });

    it('file entry has {image}', async () => {
      const { files } = await getStatic();

      const png = files.filter((file) => file.path.endsWith('.png'));
      const jpg = files.filter((file) => file.path.endsWith('.jpg'));
      const svg = files.filter((file) => file.path.endsWith('.svg'));
      const images = [...png, ...jpg, ...svg];
      const other = files.filter((file) => !images.some((img) => img.path === file.path));

      expect(png.length).to.eql(2);
      expect(jpg.length).to.eql(1);
      expect(svg.length).to.eql(1);

      for (const item of other) {
        expect(item.image).to.eql(undefined);
      }

      for (const item of images) {
        expect(item.image).to.not.eql(undefined);
        expect(typeof item.image?.width).to.eql('number');
        expect(typeof item.image?.height).to.eql('number');
      }
    });
  });
});
