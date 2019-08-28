import { expect, expectError } from '@platform/test';
import { fs } from '..';

describe('ancestor', () => {
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
      const res = await ancestor.walk(e => e.stop());
      expect(res.levels).to.eql(0);
      expect(res.isStopped).to.eql(true);
      expect(res.isRoot).to.eql(false);
      expect(res.dir).to.eql(fs.resolve(dir));
    });

    it('SYNC: stops immediately (sync)', () => {
      const ancestor = fs.ancestor(dir);
      const res = ancestor.walkSync(e => e.stop());
      expect(res.levels).to.eql(0);
      expect(res.isStopped).to.eql(true);
      expect(res.isRoot).to.eql(false);
      expect(res.dir).to.eql(fs.resolve(dir));
    });

    it('stops immediately (async)', async () => {
      const ancestor = fs.ancestor(dir);
      const res = await ancestor.walk(async e => {
        await delay(10, () => e.stop());
      });
      expect(res.levels).to.eql(0);
      expect(res.isStopped).to.eql(true);
      expect(res.isRoot).to.eql(false);
      expect(res.dir).to.eql(fs.resolve(dir));
    });

    it('SYNC: throws when visitor is (async)', async () => {
      const ancestor = fs.ancestor(dir);
      const fn = () => ancestor.walkSync(async e => true);
      expect(fn).to.throw(/Sync version of walk should not return a promise/);
    });

    it('stop at module root', async () => {
      const ancestor = fs.ancestor(dir);
      const res = await ancestor.walk(async e => {
        if (e.dir.endsWith('/fs/test')) {
          e.stop();
        }
      });
      expect(res.levels).to.eql(4);
    });

    it('SYNC: stop at module root', () => {
      const ancestor = fs.ancestor(dir);
      const res = ancestor.walkSync(e => {
        if (e.dir.endsWith('/fs/test')) {
          e.stop();
        }
      });
      expect(res.levels).to.eql(4);
    });

    it('walks up to root (not stopped)', async () => {
      const ancestor = fs.ancestor(dir);
      const res = await ancestor.walk(async e => false);
      expect(res.levels).to.greaterThan(6);
      expect(res.dir).to.eql('/');
      expect(res.isStopped).to.eql(false);
      expect(res.isRoot).to.eql(true);
    });

    it('SYNC: walks up to root (not stopped)', () => {
      const ancestor = fs.ancestor(dir);
      const res = ancestor.walkSync(e => false);
      expect(res.levels).to.greaterThan(6);
      expect(res.dir).to.eql('/');
      expect(res.isStopped).to.eql(false);
      expect(res.isRoot).to.eql(true);
    });

    it('starting path is a file (not a directory)', async () => {
      const dir = 'test/ancestor/1/1.yml';
      const ancestor = fs.ancestor(dir);
      const res = await ancestor.walk(async e => e.stop());
      expect(res.dir).to.eql(fs.resolve('test/ancestor/1'));
    });

    it('SYNC: starting path is a file (not a directory)', () => {
      const dir = 'test/ancestor/1/1.yml';
      const ancestor = fs.ancestor(dir);
      const res = ancestor.walkSync(e => e.stop());
      expect(res.dir).to.eql(fs.resolve('test/ancestor/1'));
    });

    it('starting path does not exist', async () => {
      const ancestor = fs.ancestor('/no/exist');
      return expectError(() => ancestor.walk(async e => false), 'Path does not exist');
    });

    it('SYNC: starting path does not exist', () => {
      const ancestor = fs.ancestor('/no/exist');
      const fn = () => ancestor.walkSync(e => false);
      expect(fn).to.throw(/Path does not exist/);
    });
  });

  describe('first', () => {
    const dir = 'test/ancestor/1/2/3';

    describe('file', () => {
      it('same level', async () => {
        const res = await fs.ancestor(dir).first('3.yml');
        expect(res).to.eql(fs.resolve('test/ancestor/1/2/3/3.yml'));
      });

      it('SYNC same level', () => {
        const res = fs.ancestor(dir).firstSync('3.yml');
        expect(res).to.eql(fs.resolve('test/ancestor/1/2/3/3.yml'));
      });

      it('multiple levels up', async () => {
        const res = await fs.ancestor(dir).first('1.yml');
        expect(res).to.eql(fs.resolve('test/ancestor/1/1.yml'));
      });

      it('SYNC multiple levels up', () => {
        const res = fs.ancestor(dir).firstSync('1.yml');
        expect(res).to.eql(fs.resolve('test/ancestor/1/1.yml'));
      });

      it('minimatch', async () => {
        const res = await fs.ancestor(dir).first('2.{yml,yaml}');
        expect(res).to.eql(fs.resolve('test/ancestor/1/2/2.yml'));
      });

      it('SYNC minimatch', () => {
        const res = fs.ancestor(dir).firstSync('2.{yml,yaml}');
        expect(res).to.eql(fs.resolve('test/ancestor/1/2/2.yml'));
      });

      it('max levels up', async () => {
        const res1 = await fs.ancestor(dir).first('1.yml', { max: 1 });
        const res2 = await fs.ancestor(dir).first('1.yml', { max: 2 });
        const res3 = await fs.ancestor(dir).first('1.yml', { max: 3 });
        const res4 = await fs.ancestor(dir).first('2.yml', { max: 2 });
        expect(res1).to.eql('');
        expect(res2).to.eql(fs.resolve('test/ancestor/1/1.yml'));
        expect(res3).to.eql(fs.resolve('test/ancestor/1/1.yml'));
        expect(res4).to.eql(fs.resolve('test/ancestor/1/2/2.yml'));
      });

      it('SYNC max levels up', () => {
        const res1 = fs.ancestor(dir).firstSync('1.yml', { max: 1 });
        const res2 = fs.ancestor(dir).firstSync('1.yml', { max: 2 });
        const res3 = fs.ancestor(dir).firstSync('1.yml', { max: 3 });
        const res4 = fs.ancestor(dir).firstSync('2.yml', { max: 2 });
        expect(res1).to.eql('');
        expect(res2).to.eql(fs.resolve('test/ancestor/1/1.yml'));
        expect(res3).to.eql(fs.resolve('test/ancestor/1/1.yml'));
        expect(res4).to.eql(fs.resolve('test/ancestor/1/2/2.yml'));
      });
    });

    describe('dir', () => {
      it('parent', async () => {
        const res = await fs.ancestor(dir).first('3');
        expect(res).to.eql(fs.resolve(dir));
      });

      it('SYNC parent', () => {
        const res = fs.ancestor(dir).firstSync('3');
        expect(res).to.eql(fs.resolve(dir));
      });

      it('multiple levels up', async () => {
        const res = await fs.ancestor(dir).first('test');
        expect(res).to.eql(fs.resolve('test'));
      });

      it('SYNC multiple levels up', () => {
        const res = fs.ancestor(dir).firstSync('test');
        expect(res).to.eql(fs.resolve('test'));
      });
    });

    describe('type', () => {
      it('files only', async () => {
        const res = await fs.ancestor(dir).first('test', { type: 'FILE' });
        expect(res).to.eql('');
      });

      it('SYNC files only', () => {
        const res = fs.ancestor(dir).firstSync('test', { type: 'FILE' });
        expect(res).to.eql('');
      });

      it('folders only', async () => {
        const res = await fs.ancestor(dir).first('1.yml', { type: 'DIR' });
        expect(res).to.eql('');
      });

      it('SYNC folders only', () => {
        const res = fs.ancestor(dir).firstSync('1.yml', { type: 'DIR' });
        expect(res).to.eql('');
      });
    });

    it('no match', async () => {
      const test = async (input: string) => {
        const res = await fs.ancestor(dir).first(input);
        expect(res).to.eql('');
      };
      await test('/NO_EXIST');
      await test('');
      await test(' ');
    });

    it('SYNC no match', () => {
      const test = (input: string) => {
        const res = fs.ancestor(dir).firstSync(input);
        expect(res).to.eql('');
      };
      test('/NO_EXIST');
      test('');
      test(' ');
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
