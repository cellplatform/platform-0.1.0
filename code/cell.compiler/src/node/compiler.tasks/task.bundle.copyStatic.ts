import { fs, Model, t } from '../common';

/**
 * Copy in static folders.
 */
export async function copyStatic(args: { model: t.CompilerModel; dir: string }) {
  const model = Model(args.model);

  const staticDirs = model
    .static()
    .map(({ dir }) => dir as string)
    .filter(Boolean);

  const wait = staticDirs.map((from) => {
    const to = fs.join(args.dir, fs.basename(from));
    return fs.copy(from, to);
  });

  await Promise.all(wait);
  return staticDirs;
}
