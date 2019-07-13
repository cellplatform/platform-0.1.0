import { fs, t } from '../common';
import { PgDoc } from '../PgDoc';

/**
 * Imports matching files from the given dir into the DB.
 */
export async function importFiles(args: { db: PgDoc; dir: string }) {
  // Setup initial conditions.
  const { db } = args;
  const dir = fs.resolve(args.dir);
  await fs.ensureDir(dir);

  // Read in file.
  const paths = await fs.glob.find(fs.join(dir, '**/*.json'));

  const toItem = (key: string, json: any) => {
    const value = json.data;
    const isObject = typeof value === 'object';

    let createdAt = json.createdAt || -1;
    let modifiedAt = json.modifiedAt || -1;

    createdAt = createdAt === -1 && isObject && value.createdAt ? value.createdAt : createdAt;
    modifiedAt = modifiedAt === -1 && isObject && value.modifiedAt ? value.modifiedAt : modifiedAt;

    const item: t.IDbPutItem = {
      key,
      value,
      createdAt,
      modifiedAt,
    };
    return item;
  };

  const toItems = (file: object): t.IDbPutItem[] => {
    return Object.keys(file)
      .map(key => ({ key, json: file[key] }))
      .filter(({ json }) => typeof json === 'object')
      .map(({ key, json }) => toItem(key, json));
  };

  let count = 0;
  const errors: Array<{ path: string; error: Error }> = [];
  for (const path of paths) {
    const file = await fs.readJson(path);
    if (typeof file === 'object') {
      const items = toItems(file);

      try {
        await db.putMany(items);
        count += items.length;
      } catch (error) {
        errors.push({ path, error });
      }
    }
  }

  // Finish up.
  const ok = errors.length === 0;
  return { ok, count, errors };
}
