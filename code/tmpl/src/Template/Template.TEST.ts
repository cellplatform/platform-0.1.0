import { expectError, expect } from '../test';
import { Observable } from 'rxjs';

import { Template } from '.';
import { fs, fsPath, isBinaryFile, t } from '../common';

const TEST_DIR = './tmp/test';
const cleanUp = async () => fs.remove(TEST_DIR);

describe('Template', () => {
  beforeEach(cleanUp);
  afterEach(cleanUp);

  describe('create', () => {
    it('it has no sources by default', () => {
      const tmpl = Template.create();
      expect(tmpl.sources).to.eql([]);
    });

    it('takes source within `create` method (single)', () => {
      const source = { dir: '.' };
      const tmpl = Template.create(source);
      expect(tmpl.sources.length).to.eql(1);
      expect(tmpl.sources[0]).to.eql(source);
    });

    it('takes sources within `create` method (array)', () => {
      const sources = [{ dir: './tmpl-1' }, { dir: './tmpl-2/foo', pattern: '*.ts' }];
      const tmpl = Template.create(sources);
      expect(tmpl.sources).to.eql(sources);
    });

    it('takes sources within `create` method as simple strings (array)', () => {
      const tmpl = Template.create(['./tmpl-1', './tmpl-2/foo']);
      expect(tmpl.sources).to.eql([{ dir: './tmpl-1' }, { dir: './tmpl-2/foo' }]);
    });
  });

  describe('add (source template)', () => {
    it('adds as a new instance', () => {
      const tmpl1 = Template.create({ dir: './tmpl-1' });
      const tmpl2 = tmpl1.add({ dir: './tmpl-2' });
      expect(tmpl1).to.not.equal(tmpl2);
      expect(tmpl1.sources).to.eql([{ dir: './tmpl-1' }]);
      expect(tmpl2.sources).to.eql([{ dir: './tmpl-1' }, { dir: './tmpl-2' }]);
    });

    it('add from string', () => {
      const tmpl = Template.create().add('./tmpl-1');
      expect(tmpl.sources).to.eql([{ dir: './tmpl-1' }]);
    });

    it('add from string array', () => {
      const tmpl = Template.create().add(['./tmpl-1', './tmpl-2']);
      expect(tmpl.sources).to.eql([{ dir: './tmpl-1' }, { dir: './tmpl-2' }]);
    });

    it('chaining', () => {
      const tmpl = Template.create()
        .add({ dir: './tmpl-1' })
        .add({ dir: './tmpl-2' });
      expect(tmpl.sources).to.eql([{ dir: './tmpl-1' }, { dir: './tmpl-2' }]);
    });

    it('prevents adding the same template more than once', () => {
      const tmpl = Template.create()
        .add({ dir: './tmpl-1', pattern: '*.ts' })
        .add({ dir: './tmpl-1', pattern: '*.ts' });
      expect(tmpl.sources).to.eql([{ dir: './tmpl-1', pattern: '*.ts' }]);
    });

    it('merges in another [tmpl]', () => {
      const tmpl1 = Template.create({ dir: './tmpl-1' });
      const tmpl2 = Template.create([{ dir: './tmpl-2' }, { dir: './tmpl-3' }]);
      const res = tmpl1.add(tmpl2);
      expect(res.sources).to.eql([{ dir: './tmpl-1' }, { dir: './tmpl-2' }, { dir: './tmpl-3' }]);
    });

    it('merges multiple [tmpl] items', () => {
      const tmpl1 = Template.create({ dir: './tmpl-1' });
      const tmpl2 = Template.create(['./tmpl-2', './tmpl-4']);
      const tmpl3 = Template.create().add('./tmpl-3');
      const tmpl4 = Template.create().add('./tmpl-4');
      const tmpl5 = Template.create().add({
        dir: './tmpl-4',
        targetDir: '/foo',
      });
      const res = tmpl1.add([tmpl2, tmpl3, tmpl3, tmpl1, tmpl4, tmpl5, tmpl5]);

      // NB: Added multiple times and de-duped.
      expect(res.sources).to.eql([
        { dir: './tmpl-1' },
        { dir: './tmpl-2' },
        { dir: './tmpl-4' },
        { dir: './tmpl-3' },
        { dir: './tmpl-4', targetDir: '/foo' },
      ]);
    });
  });

  describe('files', () => {
    it('has no files (dir does not exist)', async () => {
      const tmpl = Template.create({
        dir: './NO_EXIST',
        pattern: '**',
      });
      const files = await tmpl.files();
      expect(files.length).to.eql(0);
    });

    it('has no files (file does not exist)', async () => {
      const tmpl = Template.create({
        dir: './example/tmpl-1',
        pattern: 'NO_EXIST.md',
      });
      const files = await tmpl.files();
      expect(files.length).to.eql(0);
    });

    it('has no files (empty dir)', async () => {
      const tmpl = Template.create({
        dir: './example/empty',
        pattern: '**',
      });
      const files = await tmpl.files();
      expect(files.length).to.eql(0);
    });

    it('has single file', async () => {
      const source = {
        dir: './example/tmpl-1',
        pattern: 'README.md',
      };
      const tmpl = Template.create(source);
      const files = await tmpl.files();
      const file = files[0];

      expect(files.length).to.eql(1);
      expect(file.base).to.eql(fsPath.resolve(source.dir));
      expect(file.source).to.eql('/README.md');
    });

    it('has multiple files ("**" glob pattern by default)', async () => {
      const tmpl = Template.create({ dir: './example/tmpl-1' });
      const includes = (paths: string[]) => {
        expect(paths).to.include('/.babelrc');
        expect(paths).to.include('/.gitignore');
        expect(paths).to.include('/README.md');
        expect(paths).to.include('/images/face.svg');
        expect(paths).to.include('/src/index.ts');
      };
      const files = await tmpl.files();
      includes(files.map(f => f.source));
      includes(files.map(f => f.target));
    });

    it('filter pattern (.ts file only)', async () => {
      const tmpl = Template.create({
        dir: './example/tmpl-1',
        pattern: '**/*.ts',
      });
      const files = await tmpl.files();
      const paths = files.map(f => f.source);
      expect(paths).to.eql(['/index.ts', '/src/index.ts']);
    });

    it('converts a `dir` that is a file-path to a {dir, pattern}', async () => {
      const tmpl = Template.create({ dir: './example/tmpl-1/README.md' });
      const files = await tmpl.files();
      expect(files.length).to.eql(1);
      expect(files[0].source).to.eql('/README.md');
    });

    it('throws if a full file-path was given to `dir` AND a pattern was specified', async () => {
      const tmpl = Template.create().add({
        dir: './example/tmpl-1/README.md',
        pattern: '*.ts',
      });
      expectError(() => tmpl.files());
    });

    it('caches results', async () => {
      const tmpl = Template.create({ dir: './example/tmpl-1' });
      const files1 = await tmpl.files();
      const files2 = await tmpl.files();
      expect(files1).to.equal(files2);
    });

    it('forces new results (override cache)', async () => {
      const tmpl = Template.create({ dir: './example/tmpl-1' });
      const files1 = await tmpl.files();
      const files2 = await tmpl.files({ cache: false });
      expect(files1).to.not.equal(files2);
    });

    it('override file', async () => {
      const tmpl = Template.create()
        .add({ dir: './example/tmpl-2' })
        .add({ dir: './example/sub-folder/tmpl-3' });

      const files = await tmpl.files();
      const readmes = files.filter(f => f.source.endsWith('/README.md'));

      // NB: One README, taken from `tmpl-3` which overrides `tmpl-2`
      //     because `tmpl-3` was added after `tmpl-2`.
      expect(readmes.length).to.eql(1);
      expect(readmes[0].base.endsWith('/tmpl-3')).to.eql(true);
    });

    it('prepends with [targetDir] path', async () => {
      const tmpl = Template.create().add({
        dir: './example/tmpl-2',
        targetDir: '///foo//bar////', // NB: cleans up multiple "/"
      });

      const files = await tmpl.files();
      const sources = files.map(f => f.source);
      const targets = files.map(f => f.target);

      expect(sources).to.include('/README.md');
      expect(sources).to.include('/blueprint.png');
      expect(sources).to.include('/index.js');

      expect(targets).to.include('/foo/bar/README.md');
      expect(targets).to.include('/foo/bar/blueprint.png');
      expect(targets).to.include('/foo/bar/index.js');
    });

    it('prepends with [targetDir] path (single file)', async () => {
      const tmpl = Template.create().add({
        dir: './example/tmpl-2',
        pattern: 'README.md',
        targetDir: '///foo//bar////', // NB: cleans up multiple "/"
      });

      const files = await tmpl.files();
      const sources = files.map(f => f.source);
      const targets = files.map(f => f.target);

      expect(sources).to.include('/README.md');
      expect(targets).to.include('/foo/bar/README.md');
    });
  });

  describe('filter', () => {
    it('adds as a new instance', () => {
      const tmpl1 = Template.create({ dir: './tmpl-1' });
      const tmpl2 = tmpl1.filter(file => true);
      expect(tmpl1).to.not.equal(tmpl2);
    });

    it('applies filter', async () => {
      const tmpl1 = Template.create({ dir: './example/tmpl-2' });
      const tmpl2 = tmpl1.filter(f => f.source.endsWith('.js'));
      const files1 = await tmpl1.files();
      const files2 = await tmpl2.files();
      expect(files1.length).to.eql(3);
      expect(files2.length).to.eql(1);
    });
  });

  describe('middleware ("use")', () => {
    it('adds as a new instance', () => {
      const tmpl1 = Template.create({ dir: './tmpl-1' });
      const tmpl2 = tmpl1.use((req, res) => true);
      expect(tmpl1).to.not.equal(tmpl2);
    });

    it('process: change => write', async () => {
      type IMyVariables = { greeting: string };
      const dir = fsPath.resolve(TEST_DIR);
      const tmpl = Template.create()
        .add({ dir: './example/tmpl-2' })
        .use<IMyVariables>((req, res) => {
          if (!req.isBinary) {
            expect(typeof req.text).to.eql('string');
          }
          if (req.isBinary) {
            expect(req.text).to.eql(undefined);
          }
          res.replaceText(/__GREETING__/g, req.variables.greeting);
          res.next();
        })
        .use(async (req, res) => {
          const path = fsPath.join(dir, req.path.target);
          await fs.ensureDir(dir);
          await fs.writeFile(path, req.buffer);
          res.complete();
        });

      await tmpl.execute<IMyVariables>({ variables: { greeting: 'Hello!' } });

      const file = {
        indexJs: await fs.readFile(fsPath.join(dir, 'index.js'), 'utf8'),
        readme: await fs.readFile(fsPath.join(dir, 'README.md'), 'utf8'),
      };
      const isBlueprintBinary = await isBinaryFile(fsPath.join(dir, 'blueprint.png'));
      expect(file.indexJs).to.include(`console.log('Hello!');`);
      expect(file.readme).to.include(`# tmpl-2`);
      expect(isBlueprintBinary).to.eql(true);
    });

    it('process: with path filter', async () => {
      let paths: string[] = [];
      const tmpl = Template.create()
        .add('./example/tmpl-1')
        .use(/\.ts$/, (req, res) => {
          paths = [...paths, req.path.target];
          res.next();
        });
      await tmpl.execute();
      expect(paths).to.eql(['/index.ts', '/src/index.ts']);
    });
  });

  describe('dispose', () => {
    it('disposes of a template', () => {
      const tmpl = Template.create();
      let count = 0;
      tmpl.disposed$.subscribe(() => count++);
      expect(tmpl.isDisposed).to.eql(false);
      tmpl.dispose();
      expect(count).to.eql(1);
      expect(tmpl.isDisposed).to.eql(true);
    });
  });

  describe('events$ (observable)', () => {
    it('exposes an events observable', () => {
      const tmpl = Template.create();
      expect(tmpl.events$).to.be.an.instanceof(Observable);
    });

    it('fires alert event from middleware', async () => {
      type MyAlert = t.ITemplateAlert & { path: string };
      let events: t.ITemplateEvent[] = [];
      const tmpl = Template.create()
        .add('./example/tmpl-1')
        .use((req, res) => {
          res.alert<MyAlert>({ message: 'Foo', path: req.path.source });
          res.done('NEXT');
        });

      tmpl.events$.subscribe(e => (events = [...events, e]));
      await tmpl.execute();

      expect(events.length).to.be.greaterThan(0);
      const e = events
        .filter(e => e.type === 'TMPL/alert')
        .map(e => e.payload as MyAlert)
        .find(e => e.path.endsWith('.babelrc'));

      expect(e && e.message).to.eql('Foo');
      expect(e && e.path).to.eql('/.babelrc');
    });
  });

  it('fires start/complete events around [execute]', async () => {
    let events: t.ITemplateEvent[] = [];
    const tmpl = Template.create()
      .add('./example/tmpl-1')
      .use(async (req, res) => {
        res.alert({ message: 'middleware' });
        res.next();
      });

    tmpl.events$.subscribe(e => (events = [...events, e]));
    const files = await tmpl.files();
    await tmpl.execute();
    expect(events.length).to.be.greaterThan(2);

    const first = events[0] as t.IExecuteTemplateStartEvent;
    const last = events[events.length - 1] as t.IExecuteTemplateCompleteEvent;

    expect(first.type).to.eql('TMPL/execute/start');
    expect(last.type).to.eql('TMPL/execute/complete');

    expect(first.payload.files).to.eql(files);
    expect(last.payload.files).to.eql(files);
  });
});
