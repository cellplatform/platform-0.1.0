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

    it('stops immediately', async () => {
      const ancestor = fs.ancestor(dir);
      const res = await ancestor.walkUp(async e => e.stop());
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

  describe('closestAncestor', () => {});
});

/**
 * Walks up the folder tree looking for the given file.
 */
// export async function findClosestAncestor____(startDir: string, fileName: string) {
//   const find = async (dir: string): Promise<string | undefined> => {
//     if (!dir || dir === '/') {
//       return;
//     }
//     const path = fs.join(dir, fileName);
//     return (await fs.pathExists(path)) ? path : find(fs.resolve(dir, '..'));
//   };
//   return find(startDir);
// }
