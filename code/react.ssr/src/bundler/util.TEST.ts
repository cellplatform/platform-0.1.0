import { expect } from 'chai';
import { fs } from '../common';
import * as util from './util';

const tmp = fs.resolve('tmp/bundler.util');

describe('bundler.util', () => {
  beforeEach(async () => fs.remove(tmp));

  describe('semver', () => {
    const dirnames = ['0.1.0', 'bar.5', '0.1.1', '0.1.1-alpha.0', 'foo'];
    const dirs = dirnames.map(name => fs.join(tmp, name));

    const createDirs = async () => {
      await fs.remove(tmp);
      for (const dir of dirs) {
        await fs.ensureDir(dir);
      }
    };

    describe('sortedSemverChildren', () => {
      it('empty', async () => {
        const res1 = await util.sortedSemverChildren(tmp);
        expect(res1).to.eql([]);

        await fs.ensureDir(fs.join(tmp, 'foo')); // Not a semver.
        const res2 = await util.sortedSemverChildren(tmp);
        expect(res2).to.eql([]);
      });

      it('sorted', async () => {
        await createDirs();
        const res = await util.sortedSemverChildren(tmp);
        const dirnames = res.map(path => fs.basename(path));
        expect(dirnames).to.eql(['0.1.0', '0.1.1-alpha.0', '0.1.1']);
      });
    });

    describe('latestDir', () => {
      it('undefined (no semver dirs)', async () => {
        const res1 = await util.latestDir(tmp);
        expect(res1).to.eql(undefined);

        await fs.ensureDir(fs.join(tmp, 'foo')); // Not a semver.
        const res2 = await util.latestDir(tmp);
        expect(res2).to.eql(undefined);
      });

      it('latest', async () => {
        await createDirs();
        const res = await util.latestDir(tmp);
        expect(fs.basename(res)).to.eql('0.1.1');
      });
    });
  });
});
