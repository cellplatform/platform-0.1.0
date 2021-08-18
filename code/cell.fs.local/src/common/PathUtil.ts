import { t } from '../common';

type DirPath = string;

export const PathUtil = {
  async files(args: { fs: t.INodeFs; dir: DirPath; filter?: t.FsPathFilter; deep?: boolean }) {
    const { fs, filter } = args;

    if (!(await fs.exists(args.dir))) return [];

    const Filter = {
      dirs: (path: string) => args.filter?.({ path, is: { dir: true, file: false } }) ?? true,
      files: (path: string) => args.filter?.({ path, is: { dir: false, file: true } }) ?? true,
    };

    const paths = (await fs.readdir(args.dir)).map((name) => fs.join(args.dir, name));
    const dirs = (await filterPaths(paths, fs.is.dir)).filter(Filter.dirs);
    const files = paths.filter((path) => !dirs.includes(path)).filter(Filter.files);

    if (args.deep ?? true) {
      for (const dir of dirs) {
        const children = await PathUtil.files({ fs, dir, filter }); // <== RECURSION 🌳
        files.push(...children);
      }
    }

    return files;
  },
};

/**
 * Helpers
 */

async function filterPaths(paths: string[], filter: (path: string) => Promise<boolean>) {
  const wait = paths.map(async (path) => ((await filter(path)) ? path : undefined));
  return (await Promise.all(wait)).filter(Boolean) as string[];
}
