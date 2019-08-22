import { expect } from 'chai';
import { fs } from '../common';
import * as util from './util';

const tmp = fs.resolve('tmp/bundler.util');

describe('bundler.util', () => {
  beforeEach(async () => fs.remove(tmp));

  describe('dir', () => {
    const dirnames = ['0.1.0', 'bar.5', '0.1.1', '0.1.1-alpha.0', 'foo'];
    const dirs = dirnames.map(name => fs.join(tmp, name));

    const createDirs = async () => {
      await fs.remove(tmp);
      for (const dir of dirs) {
        await fs.ensureDir(dir);
      }
    };

    describe('sorted', () => {
      it('empty', async () => {
        const res1 = await util.dir(tmp).semver();
        expect(res1).to.eql([]);

        await fs.ensureDir(fs.join(tmp, 'foo')); // Not a semver.
        const res2 = await util.dir(tmp).semver();
        expect(res2).to.eql([]);
      });

      it('sorted (ascending, default)', async () => {
        await createDirs();
        const res = await util.dir(tmp).semver();
        const dirnames = res.map(path => fs.basename(path));
        expect(dirnames).to.eql(['0.1.0', '0.1.1-alpha.0', '0.1.1']);
      });

      it('sorted (descending)', async () => {
        await createDirs();
        const res = await util.dir(tmp).semver({ sort: 'DESC' });
        const dirnames = res.map(path => fs.basename(path));
        expect(dirnames).to.eql(['0.1.1', '0.1.1-alpha.0', '0.1.0']);
      });
    });

    describe('latestDir', () => {
      it('undefined (no semver dirs)', async () => {
        const res1 = await util.dir(tmp).latest();
        expect(res1).to.eql(undefined);

        await fs.ensureDir(fs.join(tmp, 'foo')); // Not a semver.
        const res2 = await util.dir(tmp).latest();
        expect(res2).to.eql(undefined);
      });

      it('latest', async () => {
        await createDirs();
        const res = await util.dir(tmp).latest();
        expect(fs.basename(res)).to.eql('0.1.1');
      });
    });
  });
});
