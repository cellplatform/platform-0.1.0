import { t, expect, expectError, fs } from '../test';
import { savePackage } from './savePackage';

const PKG = require('../../package.json') as t.NpmPackageJson; // eslint-disable-line
const target = 'tmp/constants.pkg.ts';
const loadTarget = async () => (await fs.readFile(fs.resolve(target))).toString();

describe('ts/savePackage', () => {
  afterEach(async () => fs.remove(fs.resolve(target)));

  it('saves name/version', async () => {
    await savePackage({ fs, source: 'package.json', target });
    const res = await loadTarget();

    expect(res).to.include(`name: '@platform/npm',`);
    expect(res).to.include(`version: '${PKG.version}',`);

    expect(res).to.not.include(`scripts:`);
    expect(res).to.not.include(`dependencies:`); // etc.
  });

  it('saves (default source)', async () => {
    await savePackage({ fs, target });
    const res = await loadTarget();

    expect(res).to.include(`name: '@platform/npm',`);
    expect(res).to.include(`version: '${PKG.version}',`);

    expect(res).to.not.include(`scripts:`);
    expect(res).to.not.include(`dependencies:`); // etc.
  });

  it('saves version (only)', async () => {
    await savePackage({ fs, source: 'package.json', target, fields: ['version'] });
    const res = await loadTarget();

    expect(res).to.not.include(`name`);
    expect(res).to.include(`version: '${PKG.version}',`);
  });

  it('saves dependencies', async () => {
    await savePackage({ fs, source: 'package.json', target, fields: ['version', 'dependencies'] });
    const res = await loadTarget();

    expect(res).to.include(`version: '${PKG.version}',`);
    expect(res).to.include(`dependencies: {`);
    expect(res).to.include(`'@platform/types':`);
  });

  describe('error', () => {
    it('throw: source not found', async () => {
      const fn = () => savePackage({ fs, source: 'foo.json', target });
      await expectError(fn, 'does not exist');
    });

    it('throw: source invalid JSON', async () => {
      const fn = () => savePackage({ fs, source: '../../README.md', target });
      await expectError(fn, 'Failed to parse [package.json]');
    });
  });
});
