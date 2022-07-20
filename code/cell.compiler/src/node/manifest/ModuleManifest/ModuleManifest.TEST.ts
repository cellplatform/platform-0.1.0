import { ModuleManifest } from '..';
import { expect, fs, SampleBundles, t, expectError, time, ManifestHash } from '../../../test';

describe('ModuleManifest', function () {
  this.timeout(99999);

  const TMP = fs.resolve('./tmp/test/ModuleManifest');

  before(async () => {
    const force = false;
    await SampleBundles.simpleNode.bundle({ force });
    await SampleBundles.simpleWeb.bundle({ force });
  });

  beforeEach(() => fs.remove(TMP));

  it('filename', () => {
    expect(ModuleManifest.filename).to.eql('index.json');
  });

  it('create', async () => {
    const sample = SampleBundles.simpleNode;
    const model = sample.config.toObject();
    const dir = sample.paths.out.dist;
    const now = time.now.timestamp;
    const manifest = await ModuleManifest.create({ model, dir });
    const files = manifest.files;

    expect(files.length).to.greaterThan(0);
    expect(manifest.kind).to.eql('module');

    expect(manifest.hash.files).to.eql(ModuleManifest.hash.files(files));
    expect(manifest.hash.files).to.eql(ModuleManifest.hash.files(manifest));

    expect(manifest.hash).to.eql(ManifestHash.module(manifest.module, manifest.files));
    expect(manifest.hash.module).to.not.eql(ManifestHash.files(manifest));
    expect(manifest.hash.module).to.match(/^sha256-/);
    expect(manifest.module.remote).to.eql(undefined); // NB: nothing exported.

    expect(manifest.module.namespace).to.eql('ns.test.node');
    expect(manifest.module.version).to.eql('0.0.0');
    expect(manifest.module.compiler.startsWith('@platform/cell.compiler@')).to.eql(true);
    expect(manifest.module.compiledAt).to.within(now - 10, now + 10);

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
  });

  it('create (with custom timestamp)', async () => {
    const sample = SampleBundles.simpleNode;
    const model = sample.config.toObject();
    const dir = sample.paths.out.dist;
    const compiledAt = 1234;
    const manifest = await ModuleManifest.create({ model, dir, compiledAt });

    expect(manifest.module.compiledAt).to.eql(compiledAt);
  });

  it('remote (exports)', async () => {
    const sample = SampleBundles.simpleWeb;
    const model = sample.config.toObject();

    const manifest = await ModuleManifest.create({ model, dir: sample.paths.out.dist });
    const remote = manifest.module.remote;

    expect(remote?.entry).to.eql('remote.js');

    expect(remote?.exports.length).to.eql(2);
    expect(remote?.exports[0].path).to.eql('./App');
    expect(remote?.exports[1].path).to.eql('./Foo');
  });

  it('throw: no namespace', async () => {
    const sample = SampleBundles.simpleNode;
    const model: t.CompilerModel = {
      ...sample.config.toObject(),
      namespace: undefined, // NB: setup error condition (no "namespace").
    };
    const fn = () => ModuleManifest.create({ model, dir: sample.paths.out.dist });
    expectError(fn, `A bundle 'namespace' is required`);
  });

  it('writeFile => readFile', async () => {
    const sample = SampleBundles.simpleNode;
    const model = sample.config.toObject();
    const manifest = await ModuleManifest.create({ model, dir: sample.paths.out.dist });

    const path = fs.join(TMP, ModuleManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    await ModuleManifest.write({ manifest, dir: TMP });
    expect(await fs.pathExists(path)).to.eql(true);

    const read = await ModuleManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(manifest);
  });

  it('createAndSave', async () => {
    const sample = SampleBundles.simpleNode;
    const model = sample.config.toObject();

    const path = fs.join(TMP, ModuleManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    const res = await ModuleManifest.createAndSave({ model, dir: TMP });
    expect(res.path).to.eql(path);

    const read = await ModuleManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(res.manifest);
  });
});
