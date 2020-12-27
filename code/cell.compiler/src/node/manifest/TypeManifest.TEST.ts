import { TypeManifest } from '.';
import { expect, fs, SampleBundles, t } from '../../test';

describe('TypeManifest', function () {
  this.timeout(99999);

  const TMP = fs.resolve('./tmp/test/TypeManifest/types.d');
  const config = SampleBundles.simpleNode.config;
  const sourceDir = fs.join(SampleBundles.simpleNode.outdir, 'types.d');

  before(async () => {
    const force = false;
    await SampleBundles.simpleNode.bundle(force);
  });

  beforeEach(() => fs.remove(TMP));

  it('filename', () => {
    expect(TypeManifest.filename).to.eql('index.json');
  });

  it('create', async () => {
    const model = config.toObject();
    const manifest = await TypeManifest.create({ sourceDir, model });
    const files = manifest.files;

    const expectEvery = (fn: (file: t.FsTypeManifestFile) => boolean) => {
      expect(files.every((file) => fn(file))).to.eql(true);
    };
    expectEvery((file) => file.filehash.startsWith('sha256-'));
    expectEvery((file) => file.bytes > 0);
    expectEvery((file) => file.path.length > 0);
    expectEvery((file) => typeof file.declaration === 'object');
  });

  it('refs: imports', async () => {
    const manifest = await TypeManifest.create({ sourceDir });
    const foo = 'main/foo.d.ts';
    const file = manifest.files.find((file) => file.path === foo);

    expect(file?.declaration.imports).to.eql(['@platform/log/lib/server']);

    const files = manifest.files.filter((file) => file.path !== foo);
    expect(files.every((file) => file.declaration.imports.length === 0)).to.eql(true);
  });

  it('refs: exports', async () => {
    const manifest = await TypeManifest.create({ sourceDir });
    const foo = 'main/types.d.ts';
    const file = manifest.files.find((file) => file.path === foo);

    expect(file?.declaration.exports).to.eql([
      '@platform/cell.types',
      '@platform/cell.types/lib/types.Cell',
    ]);

    const files = manifest.files.filter((file) => file.path !== foo);
    expect(files.every((file) => file.declaration.exports.length === 0)).to.eql(true);
  });

  it('write (copyRefs) => read', async () => {
    const model = config.toObject();
    const manifest = await TypeManifest.create({ model, sourceDir });
    expect(manifest.files.length).to.greaterThan(0);

    const path = fs.join(TMP, TypeManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    await TypeManifest.write({ manifest, dir: TMP });
    expect(await fs.pathExists(path)).to.eql(true);

    const read = await TypeManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(manifest);
  });

  it('write (copyRefs)', async () => {
    const model = config.toObject();
    const manifest = await TypeManifest.create({ model, sourceDir });
    expect(manifest.files.length).to.greaterThan(0);

    const dir = fs.join(TMP, 'main');
    const manifestPath = fs.join(dir, TypeManifest.filename);
    expect(await fs.pathExists(manifestPath)).to.eql(false);

    await TypeManifest.write({ manifest, dir });
    expect(await fs.pathExists(manifestPath)).to.eql(true);

    expect(await fs.pathExists(fs.join(TMP, '@platform'))).to.eql(false);
    await TypeManifest.write({ manifest, dir, copyRefs: true });
    expect(await fs.pathExists(fs.join(TMP, '@platform'))).to.eql(true);
  });

  it('createAndSave', async () => {
    const dir = fs.join(TMP, 'createAndSave');
    const manifestPath = fs.join(dir, TypeManifest.filename);
    expect(await fs.pathExists(manifestPath)).to.eql(false);

    await fs.copy(sourceDir, dir);

    const model = config.toObject();
    const res = await TypeManifest.createAndSave({ model, sourceDir: dir });

    expect(await fs.pathExists(fs.join(dir, '@platform'))).to.eql(false);
    await TypeManifest.createAndSave({ model, sourceDir: dir, copyRefs: true });
    expect(await fs.pathExists(fs.join(dir, '@platform'))).to.eql(true);

    expect(res.path).to.eql(manifestPath);
    expect(res.manifest.files.length).to.greaterThan(0);

    const read = await TypeManifest.read({ dir });
    expect(read.path).to.eql(manifestPath);
    expect(read.manifest).to.eql(res.manifest);
  });
});
