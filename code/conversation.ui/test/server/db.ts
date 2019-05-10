import hyperdb from '@platform/hyperdb';
import { fs } from './common';

const dir = fs.resolve('./.dev/db');

export const getDb = async () => {
  const res = await hyperdb.getOrCreate({ dir, connect: false });
  return res.db;
};
