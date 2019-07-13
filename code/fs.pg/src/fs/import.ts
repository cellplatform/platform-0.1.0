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
    const item: t.IDbPutItem = {
      key,
      value: json.data,
      createdAt: json.createdAt || -1,
      modifiedAt: json.modifiedAt || -1,
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
  for (const path of paths) {
    const file = await fs.readJson(path);
    if (typeof file === 'object') {
      const items = toItems(file);
      await db.putMany(items);
      count += items.length;
    }
  }

  // Finish up.
  return { count };
}
