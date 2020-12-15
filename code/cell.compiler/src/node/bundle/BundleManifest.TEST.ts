import { BundleManifest } from '.';
import { expect, fs, SampleBundles } from '../../test';

describe('BundleManifest', function () {
  this.timeout(99999);

  const TMP = fs.resolve('./tmp/test/BundleManifest');
  const config = SampleBundles.simpleNode.config;
  const bundleDir = SampleBundles.simpleNode.outdir;

  before(async () => {
    const force = false;
    await SampleBundles.simpleNode.bundle(force);
  });

  beforeEach(() => fs.remove(TMP));

  it('create', async () => {
    const model = config.toObject();
    const manifest = await BundleManifest.create({ model, bundleDir });

    expect(manifest.hash).to.match(/^sha256-/);
    expect(manifest.mode).to.eql('production');
    expect(manifest.target).to.eql('node');
    expect(manifest.entry).to.eql('main.js');
    expect(manifest.files.length).to.greaterThan(2);

    const file = manifest.files.find((item) => item.path === 'index.json');
    expect(file?.path).to.eql('index.json');
    expect(file?.bytes).to.greaterThan(10);
    expect(file?.filehash).to.match(/^sha256-/);
  });

  it('writeFile => readFile', async () => {
    const model = config.toObject();
    const manifest = await BundleManifest.create({ model, bundleDir });

    const path = fs.join(TMP, BundleManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    await BundleManifest.write({ manifest, dir: TMP });
    expect(await fs.pathExists(path)).to.eql(true);

    const read = await BundleManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(manifest);
  });

  it('createAndSave', async () => {
    const path = fs.join(TMP, BundleManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    const model = config.toObject();
    const res = await BundleManifest.createAndSave({ model, bundleDir: TMP });
    expect(res.path).to.eql(path);

    const read = await BundleManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(res.manifest);
  });

  it('write flag: allowRedirects', async () => {
    const model = config.toObject();
    const manifest = await BundleManifest.create({ model, bundleDir });

    const js = manifest.files.find((file) => file.path.endsWith('main.js'));
    const png = manifest.files.find((file) => file.path.endsWith('.png'));

    expect(js?.allowRedirect).to.eql(false);
    expect(png?.allowRedirect).to.eql(undefined);
  });

  it('write flag: public', async () => {
    const model = config.toObject();
    const manifest = await BundleManifest.create({ model, bundleDir });

    const images = manifest.files.filter((file) => file.path.endsWith('.png'));
    const other = manifest.files.filter((file) => !file.path.endsWith('.png'));

    expect(images.every((file) => file.public === true)).to.eql(true);
    expect(other.every((file) => file.public === undefined)).to.eql(true);
  });
});
