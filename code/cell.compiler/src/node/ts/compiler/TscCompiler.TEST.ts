import { TscCompiler } from '.';
import { expect, fs, expectError, SampleBundles, t } from '../../../test';
import { formatDirs } from './TscCompiler.copy';
import { TypeManifest } from '../../manifest';

const join = (dir: t.TscCopyDir) => fs.join(dir.base, dir.dirname);

const find = async (dir: t.TscCopyDir, pattern: string) => {
  const paths = await fs.glob.find(`${join(dir)}/${pattern}`);
  const relative = paths.map((path) => path.substring(join(dir).length + 1));

  return { paths, relative };
};

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
    const source = 'src/test/test.bundles/node.simple/**/*';

    it('transpile typescript (general)', async () => {
      const outdir = fs.join(TMP, 'foo');
      await fs.remove(outdir);

      const compiler = TscCompiler();
      const res = await compiler.transpile({
        source,
        outdir,
        model: config.toObject(),
        silent: true,
      });

      expect(res.tsconfig.include).to.eql([source]);
      expect(res.error).to.eql(undefined);
      expect(res.out.dir).to.eql(outdir);

      const manifest = res.out.manifest;
      expect(manifest.kind).to.eql('typelib');
      expect(manifest.typelib.name).to.eql('node.simple');
      expect(manifest.typelib.version).to.eql('0.0.1');
      expect(manifest.typelib.entry).to.eql('./types.d.txt');

      const files = {
        d: await fs.glob.find(`${outdir}/**/*.d.ts`),
        js: await fs.glob.find(`${outdir}/**/*.js`),
      };
      expect(files.d.length).to.greaterThan(3);
      expect(files.js.length).to.greaterThan(3);
    });

    it('transpile declarations', async () => {
      const outdir = fs.join(TMP, 'foo.d');
      await fs.remove(outdir);

      const compiler = TscCompiler();
      const res = await compiler.declarations.transpile({
        source,
        outdir,
        silent: true,
        model: config.toObject(),
      });

      expect(res.error).to.eql(undefined);
      expect(res.tsconfig.include).to.eql([source]);
      expect(res.tsconfig.compilerOptions.emitDeclarationOnly).to.eql(true);
      expect(res.out.dir).to.eql(outdir);

      const manifest = res.out.manifest;
      expect(manifest.kind).to.eql('typelib');
      expect(manifest.typelib.name).to.eql('node.simple');
      expect(manifest.typelib.version).to.eql('0.0.1');
      expect(manifest.typelib.entry).to.eql('./types.d.txt');

      const files = {
        d: await fs.glob.find(`${outdir}/**/*.d.ts`),
        js: await fs.glob.find(`${outdir}/**/*.js`),
      };

      expect(files.d.length).to.greaterThan(3);
      expect(files.js.length).to.eql(0);
    });
  });

  describe('copy', () => {
    const compiler = TscCompiler();
    const from = fs.join(TMP, 'copy.from');
    const to = fs.join(TMP, 'copy.to/foo');
    const source = 'src/test/test.bundles/node.simple/**/*';

    beforeEach(async () => {
      if (!(await fs.pathExists(from))) {
        await compiler.transpile({
          source,
          outdir: from,
          model: config.toObject(),
          silent: true,
        });
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

      const err = 'Source folder to copy from does not contain [index.json] manifest';
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

      const files = {
        source: await find(res.from, '**/*'),
        target: await find(res.to, '**/*'),
      };
      expect(files.source.relative).to.eql(files.target.relative);
      expect(res.paths).to.eql(files.target.paths);
    });

    it('copies bundle - filtered', async () => {
      expect(await fs.pathExists(to)).to.eql(false);
      const res = await compiler.copy({
        from,
        to,
        filter: (path) => path.endsWith('.js'), // NB: still includes manifest (.json) even through filtered out.
      });

      const files = {
        source: await find(res.from, '**/*'),
        target: await find(res.to, '**/*'),
      };

      const isJsOrJson = (file: string) => file.endsWith('.js') || file.endsWith('.json');
      expect(files.target.relative.every(isJsOrJson)).to.eql(true);
    });

    // it('transforms file-extension', async () => {
    //   expect(await fs.pathExists(to)).to.eql(false);
    //   const res = await compiler.copy({
    //     from,
    //     to,
    //     filter: (path) => path.endsWith('.d.ts'),
    //   });
    // });
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
