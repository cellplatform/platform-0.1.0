import * as fg from 'fast-glob';

export type IGlobOptions = {
  type?: 'FILES' | 'DIRS';
  dot?: boolean;
};

/**
 * Matches the given glob pattern as a promise.
 * See:
 *    https://www.npmjs.com/package/glob
 */
export function find(
  pattern: string,
  options: IGlobOptions = {},
): Promise<string[]> {
  return new Promise<string[]>(async (resolve, reject) => {
    const { type = 'FILES', dot = false } = options;
    const onlyDirectories = type === 'DIRS' ? true : false;
    const args = { onlyDirectories, unique: true, dot };
    const res = await fg(pattern, args);
    resolve(res as string[]);
  });
}
