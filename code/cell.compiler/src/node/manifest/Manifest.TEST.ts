import { t, expect, fs, SampleBundles, Schema } from '../../test';
import { FileManifest } from '.';

describe('FileManifest', function () {
  this.timeout(99999);

  const TMP = fs.resolve('./tmp/test/FileManifest');
  const config = SampleBundles.simpleNode.config;
  const sourceDir = SampleBundles.simpleNode.outdir;

  before(async () => {
    const force = false;
    await SampleBundles.simpleNode.bundle(force);
  });

  beforeEach(() => fs.remove(TMP));

  it('filename', () => {
    expect(FileManifest.filename).to.eql('index.json');
  });

  it('hash', () => {
    const file1: t.ManifestFile = { path: 'foo.txt', bytes: 1234, filehash: 'abc' };
    const file2: t.ManifestFile = { path: 'foo.txt', bytes: 1234, filehash: 'def' };
    const hash = Schema.hash.sha256([file1.filehash, file2.filehash]);
    expect(FileManifest.hash([file1, file2, undefined] as any)).to.eql(hash);
  });

  it('create (default)', async () => {
    const test = async (sourceDir: string) => {
      const manifest = await FileManifest.create({ sourceDir });
      const files = manifest.files;
      expect(manifest.hash).to.eql(FileManifest.hash(files));
      expect(files.length).to.greaterThan(0);

      const expectEvery = (fn: (file: t.ManifestFile) => boolean) => {
        expect(files.every((file) => fn(file))).to.eql(true);
      };

      expectEvery((file) => file.filehash.startsWith('sha256-'));
      expectEvery((file) => file.bytes > 0);
      expectEvery((file) => file.path.length > 0);
      expectEvery((file) => file.public === undefined);
      expectEvery((file) => file.allowRedirect === undefined);
    };

    await test(sourceDir);
    await test(`${sourceDir}///`);
  });

  it('does not include manifest file within list', async () => {
    const sourceDir = fs.join(TMP, 'src');
    const write = async (name: string) => {
      await fs.ensureDir(sourceDir);
      await fs.writeFile(fs.join(sourceDir, name), 'hello');
    };

    await write(FileManifest.filename);
    await write('one.txt');
    await write('two.txt');

    const manifest = await FileManifest.create({ sourceDir });
    const files = manifest.files;
    expect(files.filter((file) => file.path === FileManifest.filename).length).to.eql(0);
  });

  it('write flag: allowRedirects', async () => {
    const model = config.toObject();
    const manifest = await FileManifest.create({ model, sourceDir });

    const js = manifest.files.find((file) => file.path.endsWith('main.js'));
    const png = manifest.files.find((file) => file.path.endsWith('.png'));

    expect(js?.allowRedirect).to.eql(false);
    expect(png?.allowRedirect).to.eql(undefined);
  });

  it('write flag: public', async () => {
    const model = config.toObject();
    const manifest = await FileManifest.create({ model, sourceDir });

    const images = manifest.files.filter((file) => file.path.endsWith('.png'));
    const other = manifest.files.filter((file) => !file.path.endsWith('.png'));

    expect(images.every((file) => file.public === true)).to.eql(true);
    expect(other.every((file) => file.public === undefined)).to.eql(true);
  });

  it('writeFile => readFile', async () => {
    const model = config.toObject();
    const manifest = await FileManifest.create({ model, sourceDir });

    const path = fs.join(TMP, FileManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    await FileManifest.write({ manifest, dir: TMP });
    expect(await fs.pathExists(path)).to.eql(true);

    const read = await FileManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(manifest);
  });

  it('createAndSave', async () => {
    const path = fs.join(TMP, FileManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    const model = config.toObject();
    const res = await FileManifest.createAndSave({ model, sourceDir: TMP });
    expect(res.path).to.eql(path);

    const read = await FileManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(res.manifest);
  });
});
