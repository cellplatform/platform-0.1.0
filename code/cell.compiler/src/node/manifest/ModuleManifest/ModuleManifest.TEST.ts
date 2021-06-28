import { ModuleManifest, Manifest } from '..';
import { expect, fs, SampleBundles, t, expectError } from '../../../test';

describe('ModuleManifest', function () {
  this.timeout(99999);

  const TMP = fs.resolve('./tmp/test/ModuleManifest');
  const config = SampleBundles.simpleNode.config;
  const sourceDir = SampleBundles.simpleNode.outdir;

  before(async () => {
    const force = false;
    await SampleBundles.simpleNode.bundle({ force });
  });

  beforeEach(() => fs.remove(TMP));

  it('filename', () => {
    expect(ModuleManifest.filename).to.eql('index.json');
  });

  it('create', async () => {
    const model = config.toObject();
    const manifest = await ModuleManifest.create({ model, sourceDir });
    const files = manifest.files;

    expect(files.length).to.greaterThan(0);
    expect(manifest.kind).to.eql('module');

    expect(manifest.hash.files).to.eql(ModuleManifest.hash.files(files));
    expect(manifest.hash.files).to.eql(ModuleManifest.hash.files(manifest));
    expect(manifest.hash.files).to.match(/^sha256-/);

    expect(manifest.hash.module).to.eql(ModuleManifest.hash.module(manifest));
    expect(manifest.hash.module).to.not.eql(ModuleManifest.hash.files(manifest));
    expect(manifest.hash.module).to.match(/^sha256-/);

    expect(manifest.module.namespace).to.eql('ns.test');
    expect(manifest.module.version).to.eql('0.0.0');

    expect(manifest.module.mode).to.eql('production');
    expect(manifest.module.target).to.eql('node');
    expect(manifest.module.entry).to.eql('main.js');
    expect(manifest.files.length).to.greaterThan(2);

    const expectEvery = (fn: (file: t.ManifestFile) => boolean) => {
      expect(files.every((file) => fn(file))).to.eql(true);
    };

    const expectSome = (fn: (file: t.ManifestFile) => boolean) => {
      expect(files.some((file) => fn(file))).to.eql(true);
    };

    expectEvery((file) => file.filehash.startsWith('sha256-'));
    expectEvery((file) => file.bytes > 0);
    expectEvery((file) => file.path.length > 0);
    expectSome((file) => file.public !== undefined);
    expectSome((file) => file.allowRedirect !== undefined);
  });

  it('throw: no namespace', async () => {
    const model: t.CompilerModel = {
      ...config.toObject(),
      namespace: undefined, // NB: setup error condition (no "namespace").
    };
    const fn = () => ModuleManifest.create({ model, sourceDir });
    expectError(fn, `A bundle 'namespace' is required`);
  });

  it('writeFile => readFile', async () => {
    const model = config.toObject();
    const manifest = await ModuleManifest.create({ model, sourceDir });

    const path = fs.join(TMP, ModuleManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    await ModuleManifest.write({ manifest, dir: TMP });
    expect(await fs.pathExists(path)).to.eql(true);

    const read = await ModuleManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(manifest);
  });

  it('createAndSave', async () => {
    const path = fs.join(TMP, ModuleManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    const model = config.toObject();
    const res = await ModuleManifest.createAndSave({ model, sourceDir: TMP });
    expect(res.path).to.eql(path);

    const read = await ModuleManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(res.manifest);
  });
});
