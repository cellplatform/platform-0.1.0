import { BundleManifest } from '.';
import { expect, fs, SampleBundles } from '../../test';

describe('BundleManifest', function () {
  this.timeout(99999);

  const TMP = fs.resolve('./tmp/test/BundleManifest');
  const config = SampleBundles.simpleNode.config;
  const sourceDir = SampleBundles.simpleNode.outdir;

  before(async () => {
    const force = false;
    await SampleBundles.simpleNode.bundle(force);
  });

  beforeEach(() => fs.remove(TMP));

  it('filename', () => {
    expect(BundleManifest.filename).to.eql('index.json');
  });

  it('create', async () => {
    const model = config.toObject();
    const manifest = await BundleManifest.create({ model, sourceDir });

    expect(manifest.hash).to.match(/^sha256-/);
    expect(manifest.bundle.mode).to.eql('production');
    expect(manifest.bundle.target).to.eql('node');
    expect(manifest.bundle.entry).to.eql('main.js');
    expect(manifest.files.length).to.greaterThan(2);

    const file = manifest.files.find((item) => item.path === 'index.json');
    expect(file?.path).to.eql('index.json');
    expect(file?.bytes).to.greaterThan(10);
    expect(file?.filehash).to.match(/^sha256-/);
  });

  it('writeFile => readFile', async () => {
    const model = config.toObject();
    const manifest = await BundleManifest.create({ model, sourceDir });

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
    const res = await BundleManifest.createAndSave({ model, sourceDir: TMP });
    expect(res.path).to.eql(path);

    const read = await BundleManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(res.manifest);
  });
});
