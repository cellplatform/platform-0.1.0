import { TscCompiler } from '.';
import { expect, fs, expectError, SampleBundles, t } from '../../../test';
import { TypeManifest } from '../../Manifest';

const join = (dir: t.TscDir) => fs.join(dir.base, dir.dirname);

const find = async (dir: t.TscDir, pattern: string) => {
  const paths = await fs.glob.find(`${join(dir)}/${pattern}`);
  const relative = paths.map((path) => path.substring(join(dir).length + 1));
  return { paths, relative };
};

const source = 'src/test/test.bundles/simple.node/**/*';

describe('TscCompiler', function () {
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
    it('transpile to javascript', async () => {
      const outdir = fs.join(TMP, 'foo');
      await fs.remove(outdir);

      const compiler = TscCompiler();
      const res = await compiler.transpile({ source, outdir, silent: true });

      expect(res.tsconfig.include).to.eql([source]);
      expect(res.error).to.eql(undefined);
      expect(res.out.dir).to.eql(outdir);
      expect(res.transformations).to.eql([]);

      const manifest = res.out.manifest;
      expect(manifest.kind).to.eql('typelib');
      expect(manifest.typelib.name).to.eql('simple.node');
      expect(manifest.typelib.version).to.eql('0.0.1');
      expect(manifest.typelib.entry).to.eql('./types.d.txt');

      const manifestFiles = manifest.files.map((file) => file.path);
      expect(manifestFiles).to.include('package.json');
      expect(manifestFiles).to.not.include('index.json');

      const Files = {
        dts: await fs.glob.find(`${outdir}/**/*.d.ts`),
        js: await fs.glob.find(`${outdir}/**/*.js`),
      };
      expect(Files.dts.length).to.greaterThan(3);
      expect(Files.js.length).to.greaterThan(3);

      [...Files.dts, ...Files.js]
        .map((path) => path.substring(outdir.length + 1))
        .forEach((path) => expect(manifestFiles).to.include(path));
    });

    it('transform paths while transforming', async () => {
      const outdir = fs.join(TMP, 'foo');
      await fs.remove(outdir);

      const compiler = TscCompiler();
      const res = await compiler.transpile({
        source,
        outdir,
        silent: true,
        transformPath: (path) => path.replace(/\.d\.ts$/, '.d.txt'),
      });

      const manifest = res.out.manifest;
      const manifestFiles = manifest.files.map((file) => file.path);

      const Files = {
        dts: await fs.glob.find(`${outdir}/**/*.d.ts`),
        dtxt: await fs.glob.find(`${outdir}/**/*.d.txt`),
        js: await fs.glob.find(`${outdir}/**/*.js`),
      };
      expect(Files.dts.length).to.eql(0);
      expect(Files.dtxt.length).to.greaterThan(3);
      expect(Files.js.length).to.greaterThan(3);

      const included =
        (...exts: string[]) =>
        (p: string) =>
          exts.some((ext) => p.endsWith(ext));
      expect(manifestFiles.every(included('.js', '.d.txt', 'package.json'))).to.eql(true);
      expect(manifestFiles.some(included('.d.ts'))).to.eql(false);

      const from = res.transformations.map(({ from }) => from);
      const to = res.transformations.map(({ to }) => to);
      expect(from.every(included('.d.ts'))).to.eql(true);
      expect(to.every(included('.d.txt'))).to.eql(true);
    });

    it('copy in [package.json] file', async () => {
      const outdir = fs.join(TMP, 'foo');
      await fs.remove(outdir);

      const compiler = TscCompiler();
      const res = await compiler.transpile({ source, outdir, silent: true });
      const manifest = res.out.manifest;

      expect(manifest.files.map((f) => f.path)).to.include('package.json');

      const pkg = (await fs.readJson(fs.join(outdir, 'package.json'))) as t.NpmPackageJson;
      expect(pkg.name).to.eql('simple.node');
      expect(pkg.version).to.eql('0.0.1');
      expect(pkg.types).to.eql('./types.d.ts');

      expect(manifest.typelib.name).to.eql(pkg.name);
      expect(manifest.typelib.version).to.eql(pkg.version);
      expect(manifest.typelib.entry).to.eql('./types.d.txt'); // NB: Transformed.
    });
  });

  describe('declarations (.d.ts)', () => {
    it('transpile declarations - copyRefs recursively (default)', async () => {
      const outdir = fs.join(TMP, 'types.d/main');
      const dir = fs.dirname(outdir);
      await fs.remove(dir);
      expect(await fs.pathExists(fs.join(dir, 'rxjs'))).to.eql(false);

      const compiler = TscCompiler();
      const res = await compiler.declarations.transpile({ source, outdir, silent: true });

      expect(res.error).to.eql(undefined);
      expect(res.tsconfig.include).to.eql([source]);
      expect(res.tsconfig.compilerOptions.emitDeclarationOnly).to.eql(true);
      expect(res.out.dir).to.eql(outdir);

      expect(await fs.pathExists(fs.join(dir, 'main'))).to.eql(true);
      expect(await fs.pathExists(fs.join(dir, 'rxjs'))).to.eql(true); // NB: refs copied (by default).

      const manifest = res.out.manifest;
      const manifestFiles = manifest.files.map((file) => file.path);

      expect(manifest.kind).to.eql('typelib');
      expect(manifest.typelib.name).to.eql('simple.node');
      expect(manifest.typelib.version).to.eql('0.0.1');
      expect(manifest.typelib.entry).to.eql('./types.d.txt');

      const Files = {
        dts: await fs.glob.find(`${outdir}/**/*.d.ts`),
        dtxt: await fs.glob.find(`${outdir}/**/*.d.txt`),
        js: await fs.glob.find(`${outdir}/**/*.js`),
      };

      expect(Files.dts.length).to.eql(0);
      expect(Files.dtxt.length).to.greaterThan(3);
      expect(Files.js.length).to.eql(0);

      const included =
        (...exts: string[]) =>
        (p: string) =>
          exts.some((ext) => p.endsWith(ext));
      expect(manifestFiles.every(included('.d.txt', 'package.json'))).to.eql(true);
      expect(manifestFiles.some(included('.d.ts'))).to.eql(false);

      const from = res.transformations.map(({ from }) => from);
      const to = res.transformations.map(({ to }) => to);
      expect(from.every(included('.d.ts'))).to.eql(true);
      expect(to.every(included('.d.txt'))).to.eql(true);
    });

    it('transpile declarations - do not copyRefs', async () => {
      const outdir = fs.join(TMP, 'types.d/main');
      const dir = fs.dirname(outdir);
      await fs.remove(dir);
      expect(await fs.pathExists(fs.join(dir, 'rxjs'))).to.eql(false);

      const compiler = TscCompiler();
      await compiler.declarations.transpile({ source, outdir, silent: true, copyRefs: false });

      expect(await fs.pathExists(fs.join(dir, 'main'))).to.eql(true);
      expect(await fs.pathExists(fs.join(dir, 'rxjs'))).to.eql(false); // NB: refs not copied
    });
  });

  describe('manifest', () => {
    const compiler = TscCompiler();
    const original = fs.join(TMP, 'TscManifest.original');
    const dir = fs.join(TMP, 'TscManifest.result/main');

    beforeEach(async () => {
      if (!(await fs.pathExists(original))) {
        await compiler.transpile({ source, outdir: original, silent: true });
      }
      await fs.remove(dir);
      await fs.copy(original, dir);
    });

    it('exists', async () => {
      const test = async (dir: string, expected: boolean) => {
        const exists = await compiler.manifest.exists(dir);
        expect(exists).to.eql(expected);
      };
      await test('  ', false);
      await test(dir, true);
    });

    it('generate: no info (no [package.json] file in source folder)', async () => {
      const path = fs.join(dir, TypeManifest.filename);
      await fs.remove(path);
      await fs.remove(fs.join(dir, 'package.json'));

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

      const res = await compiler.manifest.generate({ dir });

      const info = res.manifest.typelib;
      expect(info.name).to.eql('simple.node');
      expect(info.version).to.eql('0.0.1');
      expect(info.entry).to.eql('./types.d.txt');
    });

    it('validate: ok', async () => {
      const manifest = (await TypeManifest.read({ dir })).manifest as t.TypelibManifest;
      const res = await compiler.manifest.validate(dir, manifest);
      expect(res.ok).to.eql(true);
    });

    it('validate: invalid', async () => {
      const manifest = (await TypeManifest.read({ dir })).manifest as t.TypelibManifest;
      await fs.writeFile(fs.join(dir, 'main.js'), '// my change');
      const res = await compiler.manifest.validate(dir, manifest);
      expect(res.ok).to.eql(false);
    });
  });

  describe('copy', () => {
    const compiler = TscCompiler();
    const from = fs.join(TMP, 'copy.from');
    const to = fs.join(TMP, 'copy.to/foo');

    beforeEach(async () => {
      if (!(await fs.pathExists(from))) {
        await compiler.transpile({ source, outdir: from, silent: true });
      }

      await fs.remove(fs.dirname(to));
      expect(await fs.pathExists(to)).to.eql(false);
    });

    describe('errors', () => {
      it('throw: "from" (source folder) not found', async () => {
        const fn = () => compiler.copyBundle({ from: 'foobar', to });
        await expectError(fn, 'Source folder to copy from not found');
      });

      it('throw: "from" (source folder) does not contain manifest', async () => {
        const tmp = fs.join(TMP, 'copy.tmp');
        await fs.copy(from, tmp);
        await fs.remove(fs.join(tmp, TypeManifest.filename));

        const err = 'Source folder to copy from does not contain an [index.json] manifest';
        await expectError(() => compiler.copyBundle({ from: tmp, to }), err);
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
        await expectError(() => compiler.copyBundle({ from: tmp, to }), err);
        await fs.remove(tmp);
      });
    });

    it('copies bundle - vanilla (no adjustments)', async () => {
      const res = await compiler.copyBundle({ from, to });

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

    it('copies [package.json] file', async () => {
      const res = await compiler.copyBundle({ from, to });
      const manifest = res.manifest;

      expect(manifest.files.find((f) => f.path === 'package.json')?.path).to.eql('package.json');
      expect(manifest.typelib.name).to.eql('simple.node');
      expect(manifest.typelib.version).to.eql('0.0.1');
      expect(manifest.typelib.entry).to.eql('./types.d.txt');

      const path = res.paths.find((path) => path.endsWith('foo/package.json'));
      expect(path).to.match(/foo\/package\.json$/);

      const pkg = (await fs.readJson(path || '')) as t.NpmPackageJson;
      expect(pkg.name).to.eql('simple.node');
      expect(pkg.version).to.eql('0.0.1');
      expect(pkg.types).to.eql('./types.d.ts');
    });

    it('copies bundle - filtered', async () => {
      const res = await compiler.copyBundle({
        from,
        to,
        filter: (path) => path.endsWith('.js'), // NB: still includes manifest (.json) even through filtered out.
      });

      const Files = {
        source: await find(res.from, '**/*'),
        target: await find(res.to, '**/*'),
      };

      const included =
        (...exts: string[]) =>
        (p: string) =>
          exts.some((ext) => p.endsWith(ext));
      expect(Files.target.relative.every(included('.js', '.json'))).to.eql(true);
      expect(res.transformations).to.eql([]);
    });

    it('copies and transforms file-extensions ([transformPath] argument)', async () => {
      expect(await fs.pathExists(to)).to.eql(false);
      const res = await compiler.copyBundle({
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

      const included =
        (...exts: string[]) =>
        (p: string) =>
          exts.some((ext) => p.endsWith(ext));
      expect(Files.target.relative.every(included('.js', '.json', '.d.txt'))).to.eql(true);
      expect(Files.target.relative.some(included('.d.ts'))).to.eql(false);

      expect(res.transformations.length).to.greaterThan(3);
      res.transformations.forEach(({ from, to }) => {
        expect(from.endsWith('.d.ts')).to.eql(true);
        expect(to.endsWith('.d.txt')).to.eql(true);
      });

      // NB: The modifications should not have invalidated the manifest.
      if (manifest) {
        expect((await TypeManifest.validate(to, manifest)).ok).to.eql(true);
      }

      expect(manifestFiles.every(included('.js', '.d.txt', 'package.json'))).to.eql(true);
      expect(manifestFiles.every(included('.d.ts'))).to.eql(false);
    });
  });

  describe('copyRefs', () => {
    const compiler = TscCompiler();
    const original = fs.join(TMP, 'TscCopyRefs.original');
    const dir = fs.join(TMP, 'TscCopyRefs.result/main');

    const expectPathExists = async (expected: boolean, path: string) => {
      path = fs.join(fs.dirname(dir), path);
      const exists = await fs.pathExists(path);
      expect(exists).to.eql(expected, path);
    };

    const expectRefCopied = async (path: string) => {
      await expectPathExists(true, path);
      await expectPathExists(true, fs.join(path, 'package.json'));
      await expectPathExists(true, fs.join(path, 'index.json'));
    };

    beforeEach(async () => {
      if (!(await fs.pathExists(original))) {
        const outdir = original;
        await compiler.transpile({ source, outdir, silent: true });
      }
      await fs.remove(fs.dirname(dir));
      await fs.copy(original, dir);
    });

    it('copy refs - not recursive', async () => {
      await expectPathExists(true, 'main');
      await expectPathExists(false, '@platform');
      await expectPathExists(false, 'rxjs');

      const sourceDir = dir;
      const res = await compiler.copyRefs({ sourceDir, recursive: false });

      expect(res.source).to.eql(dir);
      expect(res.target).to.eql(fs.dirname(dir));

      await expectRefCopied('@platform/cell.types');
      await expectRefCopied('@platform/log');
      await expectPathExists(false, 'rxjs');
    });

    it('copy refs - recursive', async () => {
      await expectPathExists(true, 'main');
      await expectPathExists(false, '@platform');
      await expectPathExists(false, 'rxjs');

      const sourceDir = dir;
      const res = await compiler.copyRefs({ sourceDir });

      expect(res.source).to.eql(dir);
      expect(res.target).to.eql(fs.dirname(dir));

      await expectRefCopied('@platform/cell.types');
      await expectRefCopied('@platform/cache');
      await expectRefCopied('@platform/types');
      await expectRefCopied('@platform/log');
      await expectRefCopied('rxjs');
    });

    describe('errors', () => {
      it('throw: "dir" not found', async () => {
        const fn = () => compiler.copyRefs({ sourceDir: 'not/found' });
        await expectError(fn, 'Source folder to copy from not found');
      });

      it('throw: "dir" does not contain manifest', async () => {
        await fs.remove(fs.join(dir, TypeManifest.filename));
        const err = 'Source folder to copy-refs within does not contain an [index.json] manifest';
        await expectError(() => compiler.copyRefs({ sourceDir: dir }), err);
      });

      it('throw: "dir" does not contain valid manifest', async () => {
        const { path, manifest } = await TypeManifest.read({ dir });
        delete (manifest as any).kind;
        delete (manifest as any).typelib;
        await fs.writeJson(path, manifest);

        const err = 'Source folder to copy-refs within does not contain a valid "typelib" manifest';
        await expectError(() => compiler.copyRefs({ sourceDir: dir }), err);
      });
    });
  });
});
