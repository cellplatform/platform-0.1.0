import { expect } from 'chai';
import { Glob } from '.';
import { basename, resolve, join, dirname } from 'path';
import * as fs from 'fs-extra';

const TMP = resolve('./tmp/glob');

const write = async (path: string) => {
  path = join(TMP, path);
  await fs.ensureDir(dirname(path));
  await fs.writeFile(path, 'foo');
};

const writeSampleFiles = async () => {
  await write('foo.txt');
  await write('foobar.txt');
  await write('foo.html');
  await write('bar.txt');
};

describe.only('Glob', () => {
  // beforeEach(async () => await fs.remove(TMP));
  after(async () => await fs.remove('./tmp'));

  describe('find', () => {
    it('finds several files', async () => {
      const pattern = `${__dirname}/Glob*.ts`;
      const res = await Glob.find(pattern);
      expect(res.length).to.eql(2);
      const names = res.map((p) => basename(p));
      expect(names).to.include('Glob.TEST.ts');
      expect(names).to.include('Glob.ts');
    });

    it('returns no dot-files (default)', async () => {
      const pattern = resolve('test/sample/tmpl-1/*');
      const res = await Glob.find(pattern);
      const dotFiles = res.map((path) => basename(path)).filter((file) => file.startsWith('.'));
      expect(dotFiles).to.eql([]);
    });

    it('returns dot-files', async () => {
      const pattern = resolve('test/sample/tmpl-1/*');
      const res = await Glob.find(pattern, { dot: true });
      const files = res.map((path) => basename(path)).filter((file) => file.startsWith('.'));
      expect(files).to.include('.babelrc');
      expect(files).to.include('.gitignore');
    });

    it('returns only files (by default)', async () => {
      const pattern = resolve('test/sample/tmpl-1/*');
      const res = await Glob.find(pattern);
      const names = res.map((p) => basename(p));
      expect(names).to.not.include('src');
    });

    it('returns directories and files', async () => {
      const pattern = resolve('test/sample/tmpl-1/*');
      const res = await Glob.find(pattern, { includeDirs: true });
      const names = res.map((p) => basename(p));
      expect(names).to.include('index.ts');
      expect(names).to.include('README.md');
      expect(names).to.include('src');
      expect(names).to.include('images');
    });

    it('returns only directories (implicit from pattern)', async () => {
      const pattern = `${resolve('test/sample/tmpl-1')}/*/`;
      const res = await Glob.find(pattern); // NB: [includDirs] turned on by default.
      const names = res.map((p) => basename(p));
      expect(names).to.include('src');
      expect(names).to.include('images');
    });

    it('returns directories, no match (implicit from pattern, but cancelled in args)', async () => {
      const pattern = `${resolve('test/sample/tmpl-1')}/*/`;
      const res = await Glob.find(pattern, { includeDirs: false });
      expect(res).to.eql([]);
    });

    it('ignores a specific child directory', async () => {
      const root = resolve('test/sample');
      const pattern = `${root}/**`;

      const res1 = await Glob.find(pattern, { ignore: '**/tmpl-1/**' });
      const res2 = await Glob.find(pattern, { ignore: ['**/tmpl-1/**'] });
      const res3 = await Glob.find(pattern, { ignore: ['**/tmpl-1/**', '**/child-1/**'] });
      expect(res1).to.eql(res2);

      const trimPaths = (paths: string[]) => paths.map((path) => path.substring(root.length + 1));

      const expectSet = (result: string[], expected: string[]) => {
        result = trimPaths(result);
        const included = expected.every((p1) => result.some((p2) => p2 === p1));
        expect(result.length).to.eql(expected.length);
        expect(included).to.eql(true);
      };

      // NB: "tmpl-1" folder ignored.
      expectSet(res1, ['child-1/README.md', 'child-2/README.md', 'foo.json', 'my-file.md']);

      // NB: "tmpl-1" AND "child-1" folders ignored.
      expectSet(res3, ['child-2/README.md', 'foo.json', 'my-file.md']);
    });

    it('filter (as option)', async () => {
      await writeSampleFiles();

      const res1 = await Glob.find(`${TMP}/*`, { filter: (path) => path.endsWith('.html') });
      const res2 = await Glob.find(`${TMP}/*`, { filter: (path) => path.endsWith('.txt') });
      const res3 = await Glob.find(`${TMP}/*.txt`, {
        filter: (path) => basename(path).startsWith('foo'),
      });

      const files1 = res1.map((path) => basename(path));
      const files2 = res2.map((path) => basename(path));
      const files3 = res3.map((path) => basename(path));

      expect(files1).to.eql(['foo.html']);
      expect(files2).to.eql(['bar.txt', 'foo.txt', 'foobar.txt']);
      expect(files3).to.eql(['foo.txt', 'foobar.txt']);
    });
  });

  describe('remove', () => {
    it('removes matching items', async () => {
      await writeSampleFiles();
      expect((await Glob.find(`${TMP}/*`)).length).to.eql(4);

      const res = await Glob.remove(`${TMP}/foo*.txt`);
      expect(res.length).to.eql(2);
      expect(res[0].endsWith('/foo.txt')).to.eql(true);
      expect(res[1].endsWith('/foobar.txt')).to.eql(true);

      const paths = await Glob.find(`${TMP}/*`);
      expect(paths.length).to.eql(2);
      expect(paths[0].endsWith('/bar.txt')).to.eql(true);
      expect(paths[1].endsWith('/foo.html')).to.eql(true);
    });

    it('no matching items to remove', async () => {
      await writeSampleFiles();
      expect((await Glob.find(`${TMP}/*`)).length).to.eql(4);

      const res = await Glob.remove(`${TMP}/foo*.json`);
      expect(res).to.eql([]);

      const paths = await Glob.find(`${TMP}/*`);
      expect(paths.length).to.eql(4);
    });
  });
});
