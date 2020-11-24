import { BundleManifest } from '.';
import { expect, fs, TestCompile } from '../../test';

const TMP = fs.resolve('./tmp/test/BundleManifest');
const bundleDir = fs.resolve('dist/test/node');
const config = TestCompile.node.config;

describe.only('BundleManifest', function () {
  this.timeout(99999);

  before(async () => {
    /**
     * Ensure sample node distribution has been compiled.
     */
    const dist = fs.resolve(bundleDir);
    if (!(await fs.pathExists(fs.join(dist, 'main.js')))) {
      await TestCompile.node.bundle();
    }
  });

  beforeEach(() => fs.remove(TMP));

  it('create', async () => {
    const model = config.toObject();
    const manifest = await BundleManifest.create({ model, bundleDir });

    expect(manifest.hash).to.match(/^sha256-/);
    expect(manifest.mode).to.eql('production');
    expect(manifest.target).to.eql('node');
    expect(manifest.entry).to.eql('main.js');
    expect(manifest.bytes).to.greaterThan(1000);
    expect(manifest.files.length).to.greaterThan(2);

    const file = manifest.files[0];
    expect(file.path).to.eql('index.json');
    expect(file.bytes).to.greaterThan(10);
    expect(file.filehash).to.match(/^sha256-/);
  });

  it('writeFile => readFile', async () => {
    const model = config.toObject();
    const manifest = await BundleManifest.create({ model, bundleDir });

    const path = fs.join(TMP, BundleManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    await BundleManifest.writeFile({ manifest, bundleDir: TMP });
    expect(await fs.pathExists(path)).to.eql(true);

    const read = await BundleManifest.readFile({ bundleDir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(manifest);
  });

  it('createAndSave', async () => {
    const path = fs.join(TMP, BundleManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    const model = config.toObject();
    const res = await BundleManifest.createAndSave({ model, bundleDir: TMP });
    expect(res.path).to.eql(path);

    const read = await BundleManifest.readFile({ bundleDir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(res.manifest);
  });

  it('flag: allowRedirects', async () => {
    const model = config.toObject();
    const manifest = await BundleManifest.create({ model, bundleDir });

    const js = manifest.files.find((file) => file.path.endsWith('main.js'));
    const png = manifest.files.find((file) => file.path.endsWith('.png'));

    expect(js?.allowRedirect).to.eql(false);
    expect(png?.allowRedirect).to.eql(undefined);
  });
});
