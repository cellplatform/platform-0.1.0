import { expect, Npm } from '../test';
import { NpmPackage } from '.';

import { resolve } from 'path';
import { fs } from '../common/libs';

const TMP = resolve('./tmp/test');
const NAME = '@platform/npm';

describe('NpmPackage (package.json)', () => {
  beforeEach(async () => {
    await fs.remove(TMP);
    await fs.ensureDir(TMP);
  });

  afterEach(async () => fs.remove(TMP));

  describe('create', () => {
    it('loads with no path (default to containing module)', () => {
      const pkg = NpmPackage.create();
      expect(pkg.name).to.eql(NAME);
      expect(pkg.exists).to.eql(true);
      expect(pkg.path.endsWith('/npm/package.json')).to.eql(true);
      expect(pkg.dir.endsWith('/npm')).to.eql(true);
    });

    it('loads with relative dir', () => {
      const pkg = NpmPackage.create('.');
      expect(pkg.name).to.eql(NAME);
      expect(pkg.exists).to.eql(true);
    });

    it('loads with explicit file-path', () => {
      const pkg = NpmPackage.create('./package.json');
      expect(pkg.name).to.eql(NAME);
      expect(pkg.exists).to.eql(true);
    });

    it('loads with non-existant path', () => {
      const pkg = NpmPackage.create('/tmp/foo');
      expect(pkg.name).to.eql(undefined);
      expect(pkg.json).to.eql({});
      expect(pkg.exists).to.eql(false);
      expect(pkg.path).to.eql('/tmp/foo/package.json');
      expect(pkg.dir).to.eql('/tmp/foo');
    });

    it('creates from module method', () => {
      const pkg = Npm.pkg();
      expect(pkg).to.be.an.instanceof(NpmPackage);
      expect(pkg.name).to.eql(NAME);
      expect(pkg.exists).to.eql(true);
    });

    it('creates with JSON (no dir)', () => {
      const json = { name: 'my-module', version: '0.0.0' };
      const pkg = Npm.pkg({ json });
      expect(pkg.exists).to.eql(true);
      expect(pkg.json).to.eql(json);
      expect(pkg.path).to.eql('package.json');
      expect(pkg.dir).to.eql('');
    });

    it('creates with JSON (dir provided, exists)', () => {
      const json = { name: 'my-module', version: '0.0.0' };
      const pkg = Npm.pkg({ json, dir: './test/sample' });
      expect(pkg.exists).to.eql(true);
      expect(pkg.json).to.eql(json);
      expect(pkg.path.endsWith('test/sample/package.json')).to.eql(true);
      expect(pkg.dir.endsWith('test/sample')).to.eql(true);
    });

    it('creates with JSON (dir provided, does not exist)', () => {
      const json = { name: 'my-module', version: '0.0.0' };
      const pkg = Npm.pkg({ json, dir: '/foo/bar' });
      expect(pkg.exists).to.eql(false);
      expect(pkg.json).to.eql(json);
      expect(pkg.path).to.eql('/foo/bar/package.json');
      expect(pkg.dir).to.eql('/foo/bar');
    });
  });

  it('exposes data fields', () => {
    const pkg = Npm.NpmPackage.create();
    expect(pkg.name).to.eql(pkg.json.name);
    expect(pkg.description).to.eql(pkg.json.description);
    expect(pkg.version).to.eql(pkg.json.version);
    expect(pkg.main).to.eql(pkg.json.main);
    expect(pkg.scripts).to.eql(pkg.json.scripts || {});
    expect(pkg.dependencies).to.eql(pkg.json.dependencies || {});
    expect(pkg.devDependencies).to.eql(pkg.json.devDependencies || {});
    expect(pkg.peerDependencies).to.eql(pkg.json.peerDependencies || {});
    expect(pkg.resolutions).to.eql(pkg.json.resolutions || {});
  });

  describe('setFields', () => {
    it('adds a set of fields', () => {
      const pkg = NpmPackage.create();
      expect(pkg.scripts.script1).to.eql(undefined);
      expect(pkg.scripts.script2).to.eql(undefined);
      expect(pkg.scripts.script3).to.eql(undefined);
      pkg
        .setFields('scripts', { script1: 'echo 1', script2: 'echo 2' })
        .setFields('scripts', { script3: 'echo 3' });
      expect(pkg.scripts.script1).to.eql('echo 1');
      expect(pkg.scripts.script2).to.eql('echo 2');
      expect(pkg.scripts.script3).to.eql('echo 3');
      expect(pkg.isChanged).to.eql(true);
    });

    it('does not overwrite existing field', () => {
      const json = { scripts: { foo: 'v1' } };
      const pkg = NpmPackage.create({ json });
      pkg.setFields('scripts', { foo: 'v2' });
      expect(pkg.scripts.foo).to.eql('v1');
      expect(pkg.isChanged).to.eql(false); // NB: no change.
    });

    it('does overwrites existing field (force)', () => {
      const pkg = NpmPackage.create();
      pkg.setFields('scripts', { foo: 'v1' });
      pkg.setFields('scripts', { foo: 'v2' }, { force: true });
      expect(pkg.scripts.foo).to.eql('v2');
      expect(pkg.isChanged).to.eql(true);
    });
  });

  describe('removeFields', () => {
    it('removes fields when values match', () => {
      const fields = { foo: '123', bar: '456' };
      const pkg = NpmPackage.create().setFields('scripts', fields);
      expect(pkg.scripts.foo).to.eql('123');
      expect(pkg.scripts.bar).to.eql('456');

      pkg.removeFields('scripts', fields);
      expect(pkg.scripts.foo).to.eql(undefined);
      expect(pkg.scripts.bar).to.eql(undefined);
    });

    it('does not remove fields when values differ', () => {
      const SCRIPTS_1 = { foo: '123', bar: '456' };
      const SCRIPTS_2 = { ...SCRIPTS_1, bar: 'abc' };

      const pkg = NpmPackage.create().setFields('scripts', SCRIPTS_1);
      expect(pkg.scripts.foo).to.eql('123');
      expect(pkg.scripts.bar).to.eql('456');

      pkg.removeFields('scripts', SCRIPTS_2);
      expect(pkg.scripts.foo).to.eql(undefined);
      expect(pkg.scripts.bar).to.eql('456');
    });

    it('force removes fields', () => {
      const SCRIPTS_1 = { foo: '123', bar: '456' };
      const SCRIPTS_2 = { foo: 'abc', bar: 'def' };
      const pkg = NpmPackage.create().setFields('scripts', SCRIPTS_1);

      // No change (values differ, and not forced)
      pkg.removeFields('scripts', SCRIPTS_2);
      expect(pkg.scripts.foo).to.eql('123');
      expect(pkg.scripts.bar).to.eql('456');

      // Force remove.
      pkg.removeFields('scripts', SCRIPTS_2, { force: true });
      expect(pkg.scripts.foo).to.eql(undefined);
      expect(pkg.scripts.bar).to.eql(undefined);
    });

    it('force removes when keys are passed', () => {
      const fields = { foo: '123', bar: '456' };
      const pkg = NpmPackage.create().setFields('scripts', fields);
      expect(pkg.scripts.foo).to.eql('123');
      expect(pkg.scripts.bar).to.eql('456');

      pkg.removeFields('scripts', Object.keys(fields));
      expect(pkg.scripts.foo).to.eql(undefined);
      expect(pkg.scripts.bar).to.eql(undefined);
    });

    it('excludes the removal of specified keys', () => {
      const fields = { foo: '123', bar: '456' };
      const pkg = NpmPackage.create().setFields('scripts', fields);
      expect(pkg.scripts.foo).to.eql('123');
      expect(pkg.scripts.bar).to.eql('456');
      pkg.removeFields('scripts', Object.keys(fields), {
        force: true,
        exclude: 'foo',
      });
      expect(pkg.scripts.foo).to.eql('123');
      expect(pkg.scripts.bar).to.eql(undefined);
    });

    it('does nothing when script does not exist', () => {
      const pkg = NpmPackage.create();
      const scripts = { ...pkg.scripts };
      pkg.removeFields('scripts', { foo: 'no-exist' });
      expect(pkg.scripts).to.eql(scripts);
    });

    it('adds an object if it does not already exist', async () => {
      const resolutions = { '@types/react': '16.7.17' };
      const pkg = NpmPackage.create();
      expect(pkg.resolutions).to.eql({});
      pkg.setFields('resolutions', resolutions);
      expect(pkg.resolutions).to.eql(resolutions);
    });
  });

  describe('isChanged', () => {
    it('is NOT changed', () => {
      const pkg = NpmPackage.create();
      expect(pkg.isChanged).to.eql(false);
    });

    it('is changed', () => {
      const pkg = NpmPackage.create();
      pkg.json.name = 'Foo';
      expect(pkg.isChanged).to.eql(true);
    });
  });

  describe('save', () => {
    it('saves to given path (async)', async () => {
      const pkg = Npm.pkg('./test/sample');
      await pkg.save(TMP);
      const saved = await Npm.pkg(TMP);
      expect(saved.json).to.eql(pkg.json);
    });

    it('saves to given path (sync)', () => {
      const pkg = Npm.pkg('./test/sample');
      pkg.saveSync(TMP);
      const saved = Npm.pkg(TMP);
      expect(saved.json).to.eql(pkg.json);
    });

    it('saves to default path (async)', async () => {
      await Npm.pkg('./test/sample').save(TMP);
      const pkg = Npm.pkg(TMP);

      pkg.json.name = 'FOO';
      await pkg.save();

      const saved = Npm.pkg(TMP);
      expect(saved.name).to.eql('FOO');
      expect(saved.version).to.eql('1.0.0');
    });

    it('saves to default path (sync)', () => {
      Npm.pkg('./test/sample').saveSync(TMP);
      const pkg = Npm.pkg(TMP);

      pkg.json.name = 'FOO';
      pkg.saveSync();

      const saved = Npm.pkg(TMP);
      expect(saved.name).to.eql('FOO');
      expect(saved.version).to.eql('1.0.0');
    });
  });

  describe('toJson', () => {
    it('converts to formatted JSON with ending new-line character', () => {
      const pkg = Npm.pkg('./test/sample');
      const res = pkg.toJson();
      const json = `${JSON.stringify(pkg.json, null, '  ')}\n`;
      expect(res).to.eql(json);
    });
  });
});
