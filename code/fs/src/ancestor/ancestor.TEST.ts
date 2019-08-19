import { expect, expectError } from '@platform/test';
import { fs } from '..';

describe.only('ancestor', () => {
  describe('starting directory', () => {
    it('uses given directory (resolves)', () => {
      const res = fs.ancestor('test/ancestor');
      expect(res.dir).to.eql(fs.resolve('test/ancestor'));
    });

    it('uses given directory (pre-resolved)', () => {
      const dir = fs.resolve('test/ancestor');
      const res = fs.ancestor(dir);
      expect(res.dir).to.eql(dir);
    });
  });

  describe('walkUp', () => {
    const dir = 'test/ancestor/1/2/3';
    it('stops immediately (sync)', async () => {
      const ancestor = fs.ancestor(dir);
      const res = await ancestor.walkUp(e => e.stop());
      expect(res.levels).to.eql(0);
      expect(res.isStopped).to.eql(true);
      expect(res.isRoot).to.eql(false);
      expect(res.dir).to.eql(fs.resolve(dir));
    });

    it('stops immediately (async)', async () => {
      const ancestor = fs.ancestor(dir);
      const res = await ancestor.walkUp(async e => {
        await delay(10, () => e.stop());
      });
      expect(res.levels).to.eql(0);
      expect(res.isStopped).to.eql(true);
      expect(res.isRoot).to.eql(false);
      expect(res.dir).to.eql(fs.resolve(dir));
    });

    it('stop at module root', async () => {
      const ancestor = fs.ancestor(dir);
      const res = await ancestor.walkUp(async e => {
        if (e.dir.endsWith('/fs/test')) {
          e.stop();
        }
      });
      expect(res.levels).to.eql(4);
    });

    it('walks up to root (not stopped)', async () => {
      const ancestor = fs.ancestor(dir);
      const res = await ancestor.walkUp(async e => false);
      expect(res.levels).to.greaterThan(6);
      expect(res.dir).to.eql('/');
      expect(res.isStopped).to.eql(false);
      expect(res.isRoot).to.eql(true);
    });

    it('starting path is a file (not a directory)', async () => {
      const dir = 'test/ancestor/1/1.yml';
      const ancestor = fs.ancestor(dir);
      const res = await ancestor.walkUp(async e => e.stop());
      expect(res.dir).to.eql(fs.resolve('test/ancestor/1'));
    });

    it('starting path does not exist', async () => {
      const ancestor = fs.ancestor('/no/exist');
      return expectError(() => ancestor.walkUp(async e => false), 'Path does not exist');
    });
  });

  describe('closest', () => {
    const dir = 'test/ancestor/1/2/3';
    it('file: same level', async () => {
      const res = await fs.ancestor(dir).closest('3.yml');
      expect(res).to.eql(fs.resolve('test/ancestor/1/2/3/3.yml'));
    });

    it('file: multiple levels up', async () => {
      const res = await fs.ancestor(dir).closest('1.yml');
      expect(res).to.eql(fs.resolve('test/ancestor/1/1.yml'));
    });

    it('dir: parent', async () => {
      const res = await fs.ancestor(dir).closest('3');
      expect(res).to.eql(fs.resolve(dir));
    });

    it('dir: multiple levels up', async () => {
      const res = await fs.ancestor(dir).closest('test');
      expect(res).to.eql(fs.resolve('test'));
    });

    it('match with regex', async () => {
      const res = await fs.ancestor(dir).closest(/^foo.*\.yml$/);
      expect(res.endsWith('foobar.yml')).to.eql(true);
    });

    it('type: files only', async () => {
      const res = await fs.ancestor(dir).closest('test', { type: 'FILE' });
      expect(res).to.eql('');
    });

    it('type: folders only', async () => {
      const res = await fs.ancestor(dir).closest('1.yml', { type: 'DIR' });
      expect(res).to.eql('');
    });

    it('no match', async () => {
      const test = async (input: string | RegExp) => {
        const res = await fs.ancestor(dir).closest(input);
        expect(res).to.eql('');
      };
      await test('/NO_EXIST');
      await test(/^NO_EXIST$/);
    });
  });
});

/**
 * [Helpers]
 */
const delay = (msecs: number, callback: () => any) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (callback) {
          callback();
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    }, msecs);
  });
};
