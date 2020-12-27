import { TypeManifest, formatDirs } from './TypeManifest';
import { expect, fs, SampleBundles, t } from '../../test';

describe('TypeManifest', function () {
  this.timeout(99999);

  const TMP = fs.resolve('./tmp/test/TypeManifest');
  const config = SampleBundles.simpleNode.config;
  const base = fs.join(SampleBundles.simpleNode.outdir, 'types.d');
  const dir = 'main';

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
    const manifest = await TypeManifest.create({ base, dir, model });
    expect(manifest.kind).to.eql('types.d');

    const files = manifest.files;
    const expectEvery = (fn: (file: t.TypeManifestFile) => boolean) => {
      expect(files.every((file) => fn(file))).to.eql(true);
    };
    expectEvery((file) => file.filehash.startsWith('sha256-'));
    expectEvery((file) => file.bytes > 0);
    expectEvery((file) => file.path.length > 0);
    expectEvery((file) => typeof file.declaration === 'object');
  });

  it('refs: imports', async () => {
    const manifest = await TypeManifest.create({ base, dir });
    const foo = 'foo.d.ts';
    const file = manifest.files.find((file) => file.path === foo);

    expect(file?.declaration.imports).to.eql(['@platform/log/lib/server']);

    const files = manifest.files.filter((file) => file.path !== foo);
    expect(files.every((file) => file.declaration.imports.length === 0)).to.eql(true);
  });

  it('refs: exports', async () => {
    const manifest = await TypeManifest.create({ base, dir });
    const foo = 'types.d.ts';
    const file = manifest.files.find((file) => file.path === foo);

    expect(file?.declaration.exports).to.eql([
      '@platform/cell.types',
      '@platform/cell.types/lib/types.Cell',
    ]);

    const files = manifest.files.filter((file) => file.path !== foo);
    expect(files.every((file) => file.declaration.exports.length === 0)).to.eql(true);
  });

  it('write => read', async () => {
    const model = config.toObject();
    const manifest = await TypeManifest.create({ model, base, dir });
    expect(manifest.files.length).to.greaterThan(0);

    const path = fs.join(TMP, TypeManifest.filename);
    expect(await fs.pathExists(path)).to.eql(false);

    await TypeManifest.write({ manifest, dir: TMP });
    expect(await fs.pathExists(path)).to.eql(true);

    const read = await TypeManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(manifest);
  });

  it('write: copyRefs', async () => {
    const model = config.toObject();
    const manifest = await TypeManifest.create({ model, base, dir });
    expect(manifest.files.length).to.greaterThan(0);

    const PATHS = {
      write: fs.join(TMP, dir),
      manifest: fs.join(TMP, dir, TypeManifest.filename),
      platform: fs.join(TMP, '@platform'),
    };

    expect(await fs.pathExists(PATHS.manifest)).to.eql(false);
    await TypeManifest.write({ manifest, dir: PATHS.write });
    expect(await fs.pathExists(PATHS.manifest)).to.eql(true);

    expect(await fs.pathExists(PATHS.platform)).to.eql(false);
    await TypeManifest.write({ manifest, dir: PATHS.write, copyRefs: true });
    expect(await fs.pathExists(PATHS.platform)).to.eql(true);
  });

  it('createAndSave', async () => {
    await fs.remove(TMP);

    const PATHS = {
      base: fs.join(TMP, 'types.d'),
      dir,
      manifest: fs.join(TMP, 'types.d', dir, TypeManifest.filename),
      platform: fs.join(TMP, 'types.d', '@platform'),
    };

    expect(await fs.pathExists(PATHS.manifest)).to.eql(false);

    // Copy source files.
    await fs.copy(fs.dirname(base), TMP);

    const model = config.toObject();
    const res = await TypeManifest.createAndSave({
      model,
      base: PATHS.base,
      dir: PATHS.dir,
    });

    expect(await fs.pathExists(PATHS.platform)).to.eql(false);
    expect(await fs.pathExists(PATHS.manifest)).to.eql(true);

    await TypeManifest.createAndSave({
      model,
      base: PATHS.base,
      dir: PATHS.dir,
      copyRefs: true,
    });
    expect(await fs.pathExists(PATHS.platform)).to.eql(true);

    expect(res.path).to.eql(PATHS.manifest);
    expect(res.manifest.files.length).to.greaterThan(0);

    const read = await TypeManifest.read({ dir: fs.join(PATHS.base, PATHS.dir) });
    expect(read.path).to.eql(PATHS.manifest);
    expect(read.manifest).to.eql(res.manifest);
  });

  describe('formatDirs', () => {
    it('resolve base', () => {
      const res = formatDirs('  types.d  ', '  foo  ');
      expect(res.base).to.eql(fs.resolve('./types.d'));
      expect(res.dir).to.eql('foo');
      expect(res.join()).to.eql(fs.resolve('./types.d/foo'));
    });

    it('clean "dir" param', () => {
      const test = (dir: string) => {
        const res = formatDirs('  types.d  ', dir);
        expect(res.base).to.eql(fs.resolve('./types.d'));
        expect(res.dir).to.eql('foo');
        expect(res.join()).to.eql(fs.resolve('./types.d/foo'));
      };
      test('foo');
      test('  foo  ');
      test('//foo//');
      test('  //foo//  ');
      test(fs.resolve('types.d/foo'));
      test(fs.resolve('types.d/foo///'));
      test(`${fs.resolve('types.d/foo')}//`);
    });
  });
});
