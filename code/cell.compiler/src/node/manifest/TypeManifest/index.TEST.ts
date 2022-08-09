import { TypeManifest, formatDirs } from '.';
import { expect, fs, SampleBundles, t } from '../../../test';

export const expectFileExists = async (exists: boolean, ...parts: string[]) => {
  const path = fs.resolve(fs.join(...parts));
  expect(await fs.pathExists(path)).to.eql(exists);
};

describe('TypeManifest', function () {
  this.timeout(99999);

  const TMP = fs.resolve('tmp/test/TypeManifest');
  const config = SampleBundles.simpleNode.config;
  const base = `${TMP}.types.d`;
  const dir = 'main';

  before(async () => {
    const force = false;
    await SampleBundles.simpleNode.bundle({ force });

    // Copy the [types.d] and unzip it.
    await fs.remove(base);
    await fs.copy(fs.join(SampleBundles.simpleNode.paths.out.dist, 'types.d'), base);
    for (const zipped of await fs.glob.find(`${base}/*.zip`)) {
      const dir = zipped.substring(0, zipped.lastIndexOf('.'));
      await fs.unzip(zipped, dir);
      await fs.remove(zipped);
    }
  });

  beforeEach(async () => await fs.remove(TMP));

  it('filename', () => {
    expect(TypeManifest.filename).to.eql('index.json');
  });

  it('create: no info (default)', async () => {
    const model = config.toObject();
    const manifest = await TypeManifest.create({ base, dir, model });

    expect(manifest.kind).to.eql('typelib');
    expect(manifest.typelib).to.eql({ name: '', version: '', entry: '' });

    const files = manifest.files;
    const expectEvery = (fn: (file: t.TypelibManifestFile) => boolean) => {
      expect(files.every((file) => fn(file))).to.eql(true);
    };
    expectEvery((file) => file.filehash.startsWith('sha256-'));
    expectEvery((file) => file.bytes > 0);
    expectEvery((file) => file.path.length > 0);
    expectEvery((file) => typeof file.declaration === 'object');
  });

  it('create: explicit {info}', async () => {
    const info: t.TypelibManifestInfo = { name: 'foo', version: '1.2.3', entry: 'index.d.ts' };
    const manifest = await TypeManifest.create({ base, dir, info });
    expect(manifest.typelib).to.eql(info);
  });

  it('info: loaded from package.json', async () => {
    const pkg = (await fs.readJson(fs.resolve('package.json'))) as t.NpmPackageJson;
    const info = await TypeManifest.info('package.json');
    expect(info.name).to.eql(pkg.name);
    expect(info.version).to.eql(pkg.version);
    expect(info.entry).to.eql(pkg.types?.replace(/\.d\.ts$/, '.d.txt'));
  });

  it('refs: imports', async () => {
    const manifest = await TypeManifest.create({ base, dir });
    const foo = 'foo.d.txt';
    const file = manifest.files.find((file) => file.path === foo);

    expect(file?.declaration.imports).to.eql(['@platform/log/lib/server']);

    const files = manifest.files.filter((file) => file.path !== foo);
    expect(files.every((file) => file.declaration.imports.length === 0)).to.eql(true);
  });

  it('refs: exports', async () => {
    const manifest = await TypeManifest.create({ base, dir });
    const foo = 'types.d.txt';
    const file = manifest.files.find((file) => file.path === foo);

    expect(file?.declaration.exports).to.eql(['@platform/types']);

    const files = manifest.files.filter((file) => file.path !== foo);
    expect(files.every((file) => file.declaration.exports.length === 0)).to.eql(true);
  });

  it('write => read', async () => {
    const model = config.toObject();
    const manifest = await TypeManifest.create({ model, base, dir });

    expect(manifest.files.length).to.greaterThan(0);

    const path = fs.join(TMP, TypeManifest.filename);
    await expectFileExists(false, TMP, TypeManifest.filename);

    await TypeManifest.write({ manifest, dir: TMP });
    await expectFileExists(true, TMP, TypeManifest.filename);

    const read = await TypeManifest.read({ dir: TMP });
    expect(read.path).to.eql(path);
    expect(read.manifest).to.eql(manifest);
  });

  it('createAndSave', async () => {
    await fs.remove(TMP);

    const PATHS = {
      dir,
      base: fs.join(TMP, 'types.d'),
      manifest: fs.join(TMP, 'types.d', dir, TypeManifest.filename),
    };

    await expectFileExists(false, PATHS.manifest);

    // Copy source files.
    await fs.copy(base, PATHS.base);
    const filter = (p: string) => !p.startsWith(fs.join(PATHS.base, PATHS.dir));
    await fs.glob.remove(`${PATHS.base}/*`, { filter, includeDirs: true });

    const model = config.toObject();
    const res = await TypeManifest.createAndSave({
      model,
      base: PATHS.base,
      dir: PATHS.dir,
    });

    await expectFileExists(true, PATHS.manifest);

    expect(res.path).to.eql(PATHS.manifest);
    expect(res.manifest.files.length).to.greaterThan(0);

    const read = await TypeManifest.read({ dir: fs.join(PATHS.base, PATHS.dir) });
    expect(read.path).to.eql(PATHS.manifest);
    expect(read.manifest).to.eql(res.manifest);

    const declarations = await fs.glob.find(`${PATHS.base}/**/*.d.txt`);
    expect(declarations.length).to.greaterThan(3);
  });

  describe('formatDirs', () => {
    it('resolve base', () => {
      const res = formatDirs('  types.d  ', '  foo  ');
      expect(res.base).to.eql(fs.resolve('./types.d'));
      expect(res.dirname).to.eql('foo');
      expect(res.join()).to.eql(fs.resolve('./types.d/foo'));
    });

    it('clean "dir" param', () => {
      const test = (dir: string) => {
        const res = formatDirs('  types.d  ', dir);
        expect(res.base).to.eql(fs.resolve('./types.d'));
        expect(res.dirname).to.eql('foo');
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
