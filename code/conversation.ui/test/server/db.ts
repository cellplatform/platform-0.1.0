import { NeDoc } from '@platform/fsdb.nedb';
import { t, fs, log } from './common';

let db: t.IDb | undefined;

export const getDb = async () => {
  if (!db) {
    // TEMP 🐷 have this path configurable

    const dir = fs.resolve('./.dev/db');
    const filename = fs.join(dir, 'conversations.db');
    fs.ensureDirSync(dir);
    db = NeDoc.create({ filename });

    log.info.gray(`database created: ${filename}`);
  }

  return db;
};
