import { fs, t } from '../common';
import { PgDoc } from '../PgDoc';

/**
 * Exports the given keys from the DB to JSON files.
 */
export async function exportFiles(args: { db: PgDoc; dir: string; query: string | t.IDbQuery }) {
  // Setup initial conditions.
  const { db } = args;
  const dir = fs.resolve(args.dir);
  await fs.ensureDir(dir);

  // Retrieve items to export.
  const data = await db.find(args.query);

  // Export each item.
  await Promise.all(
    data.list.map(async ({ value, props }) => {
      const key = PgDoc.parseKey(props.key);
      const file = fs.join(dir, `${key.value}.json`);
      const { createdAt, modifiedAt } = props;
      const json = {
        [key.value]: {
          data: value,
          createdAt,
          modifiedAt,
        },
      };
      await fs.ensureDir(fs.dirname(file));
      await fs.writeFile(file, JSON.stringify(json, null, '  '));
    }),
  );
}
