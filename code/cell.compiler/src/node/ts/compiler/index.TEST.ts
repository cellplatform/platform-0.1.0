import { TscCompiler } from '.';
import { expect, fs, expectError, SampleBundles, t } from '../../../test';
import { TypeManifest } from '../../manifest';
import { TscManifest } from './TscManifest';

const join = (dir: t.TscDir) => fs.join(dir.base, dir.dirname);

const find = async (dir: t.TscDir, pattern: string) => {
  const paths = await fs.glob.find(`${join(dir)}/${pattern}`);
  const relative = paths.map((path) => path.substring(join(dir).length + 1));
  return { paths, relative };
};

const source = 'src/test/test.bundles/node.simple/**/*';

describe.only('TscCompiler', function () {
  this.timeout(99999);

  const config = SampleBundles.simpleNode.config;
  const TMP = fs.resolve('tmp/test/TscCompiler');

  // beforeEach(async () => await fs.remove(TMP));

  describe('tsconfig', () => {
    it('loads tsconfig', async () => {
      const compiler = TscCompiler();
      const tsconfig = compiler.tsconfig;
      const json1 = await tsconfig.json();
      const json2 = await tsconfig.json();

      expect(tsconfig.path).to.eql(fs.resolve('tsconfig.json'));
      expect(json1).to.eql(json2);
      expect(json1).to.not.equal(json2);
      expect(json1).to.eql(await fs.readJson(fs.resolve('tsconfig.json')));
    });

    it('throw: file not found', async () => {
      const compiler = TscCompiler('foo/bar/tsconfig.json');
      expectError(() => compiler.tsconfig.json(), 'tsconfig file not found');
    });
  });

  describe('transpile', () => {
    it('transpile typescript (general)', async () => {
      const outdir = fs.join(TMP, 'foo');
      await fs.remove(outdir);

      const compiler = TscCompiler();
      const model = config.toObject();
      const res = await compiler.transpile({ source, outdir, model, silent: true });

      expect(res.tsconfig.include).to.eql([source]);
      expect(res.error).to.eql(undefined);
      expect(res.out.dir).to.eql(outdir);

      const manifest = res.out.manifest;
      expect(manifest.kind).to.eql('typelib');
      expect(manifest.typelib.name).to.eql('node.simple');
      expect(manifest.typelib.version).to.eql('0.0.1');
      expect(manifest.typelib.entry).to.eql('./types.d.txt');

      const Files = {
        d: await fs.glob.find(`${outdir}/**/*.d.ts`),
        js: await fs.glob.find(`${outdir}/**/*.js`),
      };
      expect(Files.d.length).to.greaterThan(3);
      expect(Files.js.length).to.greaterThan(3);
    });

    it('transpile declarations', async () => {
      const outdir = fs.join(TMP, 'foo.d');
      await fs.remove(outdir);

      const compiler = TscCompiler();
      const model = config.toObject();
      const res = await compiler.declarations.transpile({ source, outdir, silent: true, model });

      expect(res.error).to.eql(undefined);
      expect(res.tsconfig.include).to.eql([source]);
      expect(res.tsconfig.compilerOptions.emitDeclarationOnly).to.eql(true);
      expect(res.out.dir).to.eql(outdir);

      const manifest = res.out.manifest;
      expect(manifest.kind).to.eql('typelib');
      expect(manifest.typelib.name).to.eql('node.simple');
      expect(manifest.typelib.version).to.eql('0.0.1');
      expect(manifest.typelib.entry).to.eql('./types.d.txt');

      const Files = {
        d: await fs.glob.find(`${outdir}/**/*.d.ts`),
        js: await fs.glob.find(`${outdir}/**/*.js`),
      };

      expect(Files.d.length).to.greaterThan(3);
      expect(Files.js.length).to.eql(0);
    });
  });

  describe('manifest', () => {
    const compiler = TscCompiler();
    const original = fs.join(TMP, 'TscManifest.original');
    const dir = fs.join(TMP, 'TscManifest.result/main');

    beforeEach(async () => {
      if (!(await fs.pathExists(original))) {
        const model = config.toObject();
        await compiler.transpile({ source, outdir: original, model, silent: true });
      }
      await fs.remove(dir);
      await fs.copy(original, dir);
    });

    it('exposes manifest api', () => {
      expect(compiler.manifest).to.equal(TscManifest);
    });

    it('exists', async () => {
      const test = async (dir: string, expected: boolean) => {
        const exists = await compiler.manifest.exists(dir);
        expect(exists).to.eql(expected);
      };
      await test('  ', false);
      await test(dir, true);
    });

    it('generate: no info', async () => {
      const path = fs.join(dir, TypeManifest.filename);
      await fs.remove(path);

      expect(await fs.pathExists(path)).to.eql(false);
      const res = await compiler.manifest.generate({ dir });
      expect(await fs.pathExists(path)).to.eql(true);

      expect(res.path).to.eql(path);
      expect(res.info).to.eql({ name: '', version: '', entry: '' });
      expect(await fs.readJson(res.path)).to.eql(res.manifest);
      expect(res.manifest.kind).to.eql('typelib');
    });

    it('generate: info (via compiler model)', async () => {
      const path = fs.join(dir, TypeManifest.filename);
      await fs.remove(path);

      const model = config.toObject();
      const res = await compiler.manifest.generate({ dir, model });

      const info = res.manifest.typelib;
      expect(info.name).to.eql('node.simple');
      expect(info.version).to.eql('0.0.1');
      expect(info.entry).to.eql('./types.d.txt');
    });
  });

  describe('copy', () => {
    const compiler = TscCompiler();
    const from = fs.join(TMP, 'copy.from');
    const to = fs.join(TMP, 'copy.to/foo');

    beforeEach(async () => {
      if (!(await fs.pathExists(from))) {
        const model = config.toObject();
        await compiler.transpile({ source, outdir: from, model, silent: true });
      }
      await fs.remove(fs.dirname(to));
    });

    it('throw: "from" (source folder) not found', async () => {
      const fn = () => compiler.copy({ from: 'foobar', to });
      await expectError(fn, 'Source folder to copy from not found');
    });

    it('throw: "from" (source folder) does not contain manifest', async () => {
      const tmp = fs.join(TMP, 'copy.tmp');
      await fs.copy(from, tmp);
      await fs.remove(fs.join(tmp, TypeManifest.filename));

      const err = 'Source folder to copy from does not contain an [index.json] manifest';
      await expectError(() => compiler.copy({ from: tmp, to }), err);
      await fs.remove(tmp);
    });

    it('throw: "from" (source folder) does not contain valid manifest', async () => {
      const tmp = fs.join(TMP, 'copy.tmp');
      await fs.copy(from, tmp);
      const { path, manifest } = await TypeManifest.read({ dir: tmp });

      delete (manifest as any).kind;
      delete (manifest as any).typelib;
      await fs.writeJson(path, manifest);

      const err = 'Source folder to copy from does not contain a valid "typelib" manifest';
      await expectError(() => compiler.copy({ from: tmp, to }), err);
      await fs.remove(tmp);
    });

    it('copies bundle - no adjustments', async () => {
      expect(await fs.pathExists(to)).to.eql(false);
      const res = await compiler.copy({ from, to });

      expect(res.from.base).to.eql(TMP);
      expect(res.from.dirname).to.eql('copy.from');

      expect(res.to.base).to.eql(fs.dirname(to));
      expect(res.to.dirname).to.eql('foo');

      const Files = {
        source: await find(res.from, '**/*'),
        target: await find(res.to, '**/*'),
        manifest: (await TypeManifest.read({ dir: join(res.to) })).manifest,
      };

      expect(Files.manifest).to.eql(res.manifest);
      expect(Files.source.relative).to.eql(Files.target.relative);
      expect(res.paths).to.eql(Files.target.paths);
      expect(res.transformations).to.eql([]);

      expect(res.manifest.files.map((file) => file.path)).to.eql(
        Files.target.relative.filter((f) => !f.endsWith('index.json')), // NB: Written files match.
      );
    });

    it('copies bundle - filtered', async () => {
      expect(await fs.pathExists(to)).to.eql(false);
      const res = await compiler.copy({
        from,
        to,
        filter: (path) => path.endsWith('.js'), // NB: still includes manifest (.json) even through filtered out.
      });

      const Files = {
        source: await find(res.from, '**/*'),
        target: await find(res.to, '**/*'),
      };

      const included = (...exts: string[]) => (p: string) => exts.some((ext) => p.endsWith(ext));
      expect(Files.target.relative.every(included('.js', '.json'))).to.eql(true);
      expect(res.transformations).to.eql([]);
    });

    it('transforms file-extension', async () => {
      expect(await fs.pathExists(to)).to.eql(false);
      const res = await compiler.copy({
        from,
        to,
        transformPath: (path) => path.replace(/\.d\.ts$/, '.d.txt'),
      });

      const Files = {
        source: await find(res.from, '**/*'),
        target: await find(res.to, '**/*'),
      };
      const manifest = (await TypeManifest.read({ dir: res.to.base })).manifest;
      const manifestFiles = manifest?.files.map((file) => file.path) || [];

      const included = (...exts: string[]) => (p: string) => exts.some((ext) => p.endsWith(ext));
      expect(Files.target.relative.every(included('.js', '.json', '.d.txt'))).to.eql(true);
      expect(Files.target.relative.some(included('.d.ts'))).to.eql(false);

      expect(res.transformations.length).to.greaterThan(3);
      res.transformations.forEach(({ from, to }) => {
        expect(from.endsWith('.d.ts')).to.eql(true);
        expect(to.endsWith('.d.txt')).to.eql(true);
      });

      // NB: The modifications should not have invalidated the manifest.
      if (manifest) {
        expect((await TypeManifest.hash.validate(to, manifest)).ok).to.eql(true);
      }

      expect(manifestFiles.every(included('.js', '.d.txt'))).to.eql(true);
      expect(manifestFiles.every(included('.d.ts'))).to.eql(false);
    });
  });

  describe('copyRefs', () => {
    const compiler = TscCompiler();
    const original = fs.join(TMP, 'TscCopyRefs.original');
    const dir = fs.join(TMP, 'TscCopyRefs.result/main');

    beforeEach(async () => {
      if (!(await fs.pathExists(original))) {
        const model = config.toObject();
        await compiler.transpile({ source, outdir: original, model, silent: true });
      }
      await fs.remove(dir);
      await fs.copy(original, dir);
    });

    it('throw: "dir" not found', async () => {
      const fn = () => compiler.copyRefs({ dir: 'not/found' });
      await expectError(fn, 'Source folder to copy from not found');
    });

    it('throw: "dir" does not contain manifest', async () => {
      await fs.remove(fs.join(dir, TypeManifest.filename));
      const err = 'Source folder to copy-refs within does not contain an [index.json] manifest';
      await expectError(() => compiler.copyRefs({ dir }), err);
    });

    it('throw: "dir" does not contain valid manifest', async () => {
      const { path, manifest } = await TypeManifest.read({ dir });
      delete (manifest as any).kind;
      delete (manifest as any).typelib;
      await fs.writeJson(path, manifest);

      const err = 'Source folder to copy-refs within does not contain a valid "typelib" manifest';
      await expectError(() => compiler.copyRefs({ dir }), err);
    });

    it('copy refs', async () => {
      const res = await compiler.copyRefs({ dir });

      console.log('-------------------------------------------');
      console.log('res', res);

      expect(join(res.dir)).to.eql(dir);
    });
  });
});
