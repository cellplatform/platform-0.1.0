import { fs, join } from '../common';
import { glob } from '../glob';
import { is } from '../is';

/**
 * Merges directories.
 */
export async function merge(
  source: string | string[],
  target: string,
  options: { overwrite?: boolean; pattern?: string } = {},
) {
  const { overwrite = false, pattern = '**' } = options;

  // Ensure the target is a directory.
  if (!(await is.dir(target))) {
    throw new Error(`Target path is not a directory: ${target}`);
  }

  // Get a listing of the target files.
  const targets = await glob.find(join(target, '**'));

  // Ensure sources are directories.
  const dirs = Array.isArray(source) ? source : [source];
  for (const dir of dirs) {
    if (!(await is.dir(dir))) {
      throw new Error(`Source path is not a directory: ${dir}`);
    }
  }

  // Prepare sources.
  const patterns = dirs.map(sourceDir => ({
    sourceDir,
    pattern: join(sourceDir, pattern),
  }));

  type Item = {
    sourceDir: string;
    paths: Array<{ from: string; to: string }>;
  };

  const items: Item[] = await Promise.all(
    patterns.map(async ({ sourceDir, pattern }) => {
      const sources = await glob.find(pattern);
      const paths = sources.map(from => {
        return {
          from,
          to: join(target, from.substr(sourceDir.length + 1)),
        };
      });
      return {
        sourceDir,
        paths,
      };
    }),
  );

  // Build filtered list of source paths to copy.
  let skipped: string[] = [];
  let copy: Array<{ from: string; to: string }> = [];
  items.forEach(item => {
    item.paths.forEach(({ from, to }) => {
      const exists = targets.some(p => p === to);
      if (exists && !overwrite) {
        skipped = [...skipped, from];
      }
      if (overwrite || !exists) {
        copy = [...copy, { from, to }];
      }
    });
  });

  // Copy files.
  await Promise.all(copy.map(({ from, to }) => fs.copy(from, to)));

  // Finish up.
  const to = copy.map(({ to }) => to);
  const from = copy.map(({ from }) => from);
  return { from, to, skipped };
}
